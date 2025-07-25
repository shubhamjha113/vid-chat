// components/VideoShimmer.js
import React from 'react';

const VideoShimmer = () => {
  return (
    <div className="flex flex-wrap justify-center p-4 gap-6">
      {Array(12).fill(0).map((_, i) => (
        <div key={i} className="w-72 p-2 animate-pulse">
          <div className="bg-gray-300 h-40 w-full rounded-lg mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

export default VideoShimmer;
