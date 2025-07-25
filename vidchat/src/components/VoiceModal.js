// src/components/VoiceModal.js
import React from 'react';

const VoiceModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-gray-900 text-white p-8 rounded-lg text-center relative w-[300px] h-[250px] flex flex-col justify-center items-center">
        <button
          className="absolute top-2 right-4 text-2xl hover:text-red-500"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-6">Listening...</h2>
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl">
          🎤
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;
