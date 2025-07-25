import React, { useEffect, useState, useCallback } from 'react';
import VideoCard from './VideoCard';
import VideoShimmer from './VideoShimmer';
import { GOOGLE_API_KEY, SHORTS_URL } from '../utils/constants';

const ShortsPage = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState('');
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchShorts = async (pageToken = '') => {
    try {
      const res = await fetch(SHORTS_URL
      );
      const data = await res.json();

      const videoIds = data.items.map(item => item.id.videoId).join(',');

      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${GOOGLE_API_KEY}`
      );
      const statsData = await statsRes.json();

      setShorts(prev => [...prev, ...statsData.items]);
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      console.error("Failed to fetch shorts:", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchShorts();
  }, []);

  const handleScroll = useCallback(() => {
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;

    if (nearBottom && !isFetchingMore && nextPageToken) {
      setIsFetchingMore(true);
      fetchShorts(nextPageToken);
    }
  }, [isFetchingMore, nextPageToken]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="pt-28 px-6 min-h-screen text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">🎬 Shorts</h1>

      {loading && <VideoShimmer />}

      <div className="flex flex-wrap gap-4">
        {shorts.map((video, index) => (
          <VideoCard key={video.id || index} info={video} />
        ))}
      </div>

      {isFetchingMore && <VideoShimmer />}
    </div>
  );
};

export default ShortsPage;
