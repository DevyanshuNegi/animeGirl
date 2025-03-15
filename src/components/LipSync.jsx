import React, { useState, useEffect, useRef } from 'react';
import Character from './Character';

const LipSync = ({ isPlaying, text }) => {
  const [currentMouthShape, setCurrentMouthShape] = useState('rest');
  const audioRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // Pre-defined animation sequence with precise timing
  const createAnimationSequence = (text) => {
    // This splits the text into words and assigns a mouth shape sequence to each word
    const words = text.split(/\s+/);
    let animationSequence = [];
    let currentTime = 0;

    words.forEach(word => {
      // Approximate speaking rate (ms per character)
      const charDuration = 70;
      const wordDuration = Math.max(200, word.length * charDuration);

      // Create a sequence of mouth shapes for this word
      const wordLetters = word.toLowerCase().split('');
      const mouthShapes = [];

      // Simple algorithm to map letters to mouth shapes
      wordLetters.forEach((letter, i) => {
        let shape = 'rest';

        // Vowels
        if ('aeiou'.includes(letter)) {
          if ('ae'.includes(letter)) shape = 'A';
          else if ('i'.includes(letter)) shape = 'E';
          else if ('o'.includes(letter)) shape = 'O';
          else if ('u'.includes(letter)) shape = 'W';
        }
        // Consonants - simplified mapping
        else if ('bmp'.includes(letter)) shape = 'B';
        else if ('cdgknstxyz'.includes(letter)) shape = 'D';
        else if ('fv'.includes(letter)) shape = 'F';
        else if ('l'.includes(letter)) shape = 'L';
        else if ('qw'.includes(letter)) shape = 'Q';
        else if ('r'.includes(letter)) shape = 'R';

        // For consecutive identical shapes, only keep one
        if (mouthShapes.length === 0 || mouthShapes[mouthShapes.length - 1].shape !== shape) {
          mouthShapes.push({ shape, duration: charDuration });
        } else {
          // Extend duration of the previous shape
          mouthShapes[mouthShapes.length - 1].duration += charDuration;
        }
      });

      // Add mouth shapes to animation sequence with absolute timing
      mouthShapes.forEach(item => {
        animationSequence.push({
          shape: item.shape,
          time: currentTime
        });
        currentTime += item.duration;
      });

      // Add a rest shape between words
      animationSequence.push({
        shape: 'rest',
        time: currentTime
      });
      currentTime += 100; // Gap between words
    });

    return animationSequence;
  };

  useEffect(() => {
    // Clean up any existing animation
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (isPlaying && text) {
      // Create synthetic speech audio
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      // Generate pre-calculated animation sequence
      const animationSequence = createAnimationSequence(text);

      // Function to start both audio and animation
      const startPerformance = () => {
        // Reset mouth
        setCurrentMouthShape('rest');

        // Schedule all mouth shape changes with precise timing
        animationSequence.forEach(item => {
          animationTimeoutRef.current = setTimeout(() => {
            setCurrentMouthShape(item.shape);
          }, item.time);
        });

        // Start speech
        window.speechSynthesis.speak(utterance);
      };

      // Start after a short delay to ensure everything is ready
      setTimeout(startPerformance, 100);

      // Clean up on unmount or when isPlaying changes
      return () => {
        window.speechSynthesis.cancel();
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
      };
    } else {
      // Stop everything if not playing
      window.speechSynthesis.cancel();
      setCurrentMouthShape('rest');
    }
  }, [isPlaying, text]);

  // Add manual controls to adjust timing
  const [timeOffset, setTimeOffset] = useState(0);

  useEffect(() => {
    // This effect handles changes to the time offset
    if (timeOffset !== 0 && isPlaying) {
      // Restart the animation with the new offset
      window.speechSynthesis.cancel();
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Reset the offset after applying it
      setTimeOffset(0);
    }
  }, [timeOffset]);

  return (
    <div className="relative">
      <Character mouthShape={currentMouthShape} />

      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 bg-white bg-opacity-70 p-2 rounded">
          <button
            onClick={() => window.speechSynthesis.pause()}
            className="px-2 py-1 bg-yellow-500 text-white text-xs rounded"
          >
            Pause
          </button>
          <button
            onClick={() => window.speechSynthesis.resume()}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded"
          >
            Resume
          </button>
        </div>
      )}
    </div>
  );
};

export default LipSync;