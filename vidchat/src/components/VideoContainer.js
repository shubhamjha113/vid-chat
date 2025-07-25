import React, { useEffect, useState, useCallback } from 'react';
import VideoCard, { AdVideoCard } from './VideoCard';
import VideoShimmer from './VideoShimmer';
import { useSelector } from 'react-redux';

const VideoContainer = () => {
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const selectedCategory = useSelector((store) => store.category.selectedCategory);

  const getVideos = async () => {
    try {
      let url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=20&regionCode=IN&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;

      // ✅ Append category filter if present
      if (selectedCategory.categoryId) {
        url += `&videoCategoryId=${selectedCategory.categoryId}`;
      }

      // ✅ Append pagination
      if (nextPageToken) {
        url += `&pageToken=${nextPageToken}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (!json.items || !Array.isArray(json.items)) {
        console.error('Unexpected API response:', json);
        return;
      }

      setVideos((prev) => [...prev, ...json.items]);
      setNextPageToken(json.nextPageToken);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    // Reset videos if category changes
    setVideos([]);
    setNextPageToken('');
    getVideos();
  }, [selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.offsetHeight;

      if (scrollTop + windowHeight >= fullHeight - 100) {
        getVideos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedCategory, nextPageToken]);

  return (
    <>
      {videos.length === 0 ? (
        <VideoShimmer />
      ) : (
        <div className="flex flex-wrap">
          {videos[0] && <AdVideoCard info={videos[10]} />}
          {videos.map((video, index) => {
            const videoId = video.id?.videoId || video.id;
            return <VideoCard key={`${videoId}_${index}`} info={video} />;
          })}
        </div>
      )}
    </>
  );
};

export default VideoContainer;
