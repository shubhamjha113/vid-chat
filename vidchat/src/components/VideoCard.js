import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ info, isAd }) => {
  const { snippet, statistics, id } = info;
  const { channelTitle, title, thumbnails } = snippet;

  const videoId = typeof id === 'object' ? id.videoId : id;
  if (!snippet || !videoId || !thumbnails?.medium?.url) return null;

  return (
    <Link to={`/watch?v=${videoId}`}>
      <div className="p-2 m-2 w-72 bg-white dark:bg-gray-800 text-black dark:text-white shadow-md dark:shadow-md transform transition duration-300 ease-in-out rounded-xl hover:scale-105 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 border border-transparent">

        <img className="rounded-lg" alt="thumbnail" src={thumbnails.medium.url} />
        <ul>
          {!isAd && (
            <>
              <li className="font-bold py-2">{title}</li>
              <li className="text-sm text-gray-600 dark:text-gray-300 font-semibold ">{channelTitle}</li>
              <li className="text-sm text-gray-500 dark:text-gray-400">{Number(statistics?.viewCount).toLocaleString()} views</li>
            </>
          )}
          {isAd && (
            <li className="font-semibold py-2 text-red-600 dark:text-red-400">{statistics?.viewCount} views</li>
          )}
        </ul>
      </div>
    </Link>
  );
};

export const AdVideoCard = ({ info }) => {
  return (
    <div className="p-1 m-1 border border-red-900 dark:border-red-400">
      <VideoCard info={info} isAd={true} />
      <div className="font-bold text-red-700 dark:text-red-400 text-center">THIS IS AD</div>
    </div>
  );
};

export default VideoCard;
