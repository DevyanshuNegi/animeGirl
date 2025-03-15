import React, { useState, useEffect } from 'react';

const Character = ({ mouthShape }) => {
  // Base character image (without mouth)
  const characterImage = '/assets/char-without-mouth.png';

  // Map phonemes to mouth images
  const mouthImages = {
    'A': '/assets/Mouths/AE.svg',
    'E': '/assets/Mouths/AE.svg',
    'B': '/assets/Mouths/BMP.svg',
    'M': '/assets/Mouths/BMP.svg',
    'P': '/assets/Mouths/BMP.svg',
    'D': '/assets/Mouths/CDGKNSTXYZ.svg',  // Combined for simplicity
    'F': '/assets/Mouths/FV.svg',
    'V': '/assets/Mouths/FV.svg',
    'L': '/assets/Mouths/L.svg',
    'O': '/assets/Mouths/O.svg',
    'Q': '/assets/Mouths/QW.svg',
    'W': '/assets/Mouths/QW.svg',
    'R': '/assets/Mouths/R.svg',
    'TH': '/assets/Mouths/TH.svg',

    'rest': '/assets/Mouths/BMP.svg',  // Default closed mouth
    // 'rest': '/assets/Mouths',  // Default closed mouth
  };

  // Load images in advance
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageCache, setImageCache] = useState({});

  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = Object.entries(mouthImages).map(([key, src]) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve({ key, img });
          img.onerror = () => reject(`Failed to load ${src}`);
        });
      });

      // Also preload character base
      imagePromises.push(new Promise((resolve, reject) => {
        const img = new Image();
        img.src = characterImage;
        img.onload = () => resolve({ key: 'base', img });
        img.onerror = () => reject(`Failed to load ${characterImage}`);
      }));

      try {
        const loadedImages = await Promise.all(imagePromises);
        const cache = {};
        loadedImages.forEach(({ key, img }) => {
          cache[key] = img.src;
        });
        setImageCache(cache);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Image loading error:", error);
        // Fall back to direct rendering even if some images failed
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  const currentMouthImage = mouthImages[mouthShape] || mouthImages['rest'];

  if (!imagesLoaded) {
    return <div className="w-64 h-64 flex items-center justify-center bg-gray-200">Loading character...</div>;
  }

  return (
    <div className="relative w-64 h-94">
      {/* Base character image */}
      <img
        src={characterImage}
        alt="Character"
        className="absolute top-0 left-0 w-full h-full"
      />

      {/* Mouth overlay */}
      <img
        src={currentMouthImage}
        alt="Mouth"
        className="absolute"
        style={{
          top: '22%',
          left: '35%',
          transform: 'translate(-50%, -50%)',
          width: '20%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default Character;