import React, { useEffect, useState } from 'react';
import VideoCard from './VideoCard';
import VideoShimmer from './VideoShimmer';

const TrendingPage = () => {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  

  const fetchTrendingVideos = async () => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY2;
     const TRENDING_API = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=IN&maxResults=50&key=${API_KEY}`;

    try {
      const res = await fetch(TRENDING_API);
      const data = await res.json();
      setTrendingVideos(data.items || []);
    } catch (err) {
      console.error('Failed to fetch trending videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingVideos();
  }, []);

  return (
    <div className="pt-28 px-6 text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">📈 Trending in India</h1>
      {loading ? (
        <VideoShimmer />
      ) : (
        <div className="flex flex-wrap gap-4">
          {trendingVideos.map((video, index) => (
            <VideoCard key={video.id} info={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingPage;
