// components/WatchShimmer.js
import React from 'react';

const WatchShimmer = () => {
  return (
    <div className="pt-24 px-6 w-full animate-pulse">
      <div className="flex flex-col lg:flex-row w-full gap-6">
        {/* Left: Video Placeholder */}
        <div className="w-full lg:w-[70%]">
          <div className="bg-gray-300 h-64 w-full rounded-lg mb-4"></div>

          <div className="h-6 bg-gray-300 w-3/4 rounded mb-2"></div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 w-32 mb-1 rounded"></div>
              <div className="h-4 bg-gray-200 w-20 rounded"></div>
            </div>
            <div className="ml-4 h-8 w-28 bg-gray-300 rounded-full"></div>
          </div>

          <div className="mt-4 h-4 w-1/2 bg-gray-300 rounded"></div>
        </div>

        {/* Right: Live Chat Placeholder */}
        <div className="w-full lg:w-[30%]">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Comments Placeholder */}
      <div className="mt-6 space-y-4">
        <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default WatchShimmer;
