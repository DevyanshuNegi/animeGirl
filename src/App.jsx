import React, { useState } from 'react';
import LipSync from './components/LipSync';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [selectedScript, setSelectedScript] = useState(0);

  // Sample scripts for different topics
  const scripts = [
    {
      title: "Introduction",
      text: "Hello! My name is Meera. I'm from a small village in India. Today we're going to learn something important for our daily lives."
    },
    {
      title: "Clean Water",
      text: "Clean water is very important for our health. When we drink clean water, we stay healthy. Dirty water can make us sick. We should always boil water before drinking if we're not sure it's clean."
    },
    {
      title: "Healthy Food",
      text: "Eating fruits and vegetables keeps us strong. Our bodies need different types of food to grow and stay healthy. Let's try to eat colorful meals with many types of food."
    }
  ];

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentText(scripts[selectedScript].text);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentText('');
  };

  const handleScriptChange = (e) => {
    if (!isPlaying) {
      setSelectedScript(Number(e.target.value));
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-indigo-800 mb-6">
          Educational Character Animation
        </h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="flex justify-center mb-6 bg-blue-50 rounded-lg p-4">
              <LipSync isPlaying={isPlaying} text={currentText} />
            </div>

            {!isPlaying && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Topic:
                </label>
                <select
                  value={selectedScript}
                  onChange={handleScriptChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={isPlaying}
                >
                  {scripts.map((script, index) => (
                    <option key={index} value={index}>
                      {script.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-indigo-100 p-3 rounded-lg mb-4">
              <h2 className="font-bold text-lg text-indigo-800 mb-2">Current Script:</h2>
              <p className="text-gray-800">{currentText || "Press Play to start the demonstration"}</p>
            </div>

            <div className="flex justify-center space-x-4">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  Play
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Debug area */}
        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">Having trouble with lip sync?</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Try refreshing the page before playing</li>
            <li>Some browsers handle speech synthesis differently</li>
            <li>Try shorter sentences for better sync</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;