import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { YOUTUBE_SEARCH_RESULTS_API } from '../utils/constants';
import VideoCard from './VideoCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search_query");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      const data = await fetch(`${YOUTUBE_SEARCH_RESULTS_API}&q=${query}`);
      const json = await data.json();
      setVideos(json.items);
    };
    fetchSearchResults();
  }, [query]);

  return (
    <div className="pt-24 px-4 flex flex-wrap">
      {videos.map((video) => (
        <VideoCard key={video.id.videoId} info={video} />
      ))}
    </div>
  );
};

export default SearchResults;
