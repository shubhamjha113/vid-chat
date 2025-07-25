import React, { useEffect, useState } from 'react';
import { ref, onValue } from "firebase/database";
import { database } from '../utils/firebase'; 
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const DownloadsPage = () => {
  const [downloads, setDownloads] = useState([]);
  const user = useSelector((state) => state.user); // Make sure you store user in redux or context

 useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem('yt-user'));
  if (!storedUser?.uid) return;

  const downloadsRef = ref(database, `downloads/${storedUser.uid}`);
  const unsubscribe = onValue(downloadsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const downloadList = Object.values(data);
      setDownloads(downloadList);
    } else {
      setDownloads([]);
    }
  });

  return () => unsubscribe();
}, []);

  return (
    <div className="p-4 pt-24 text-black dark:text-white">
      <h2 className="text-2xl font-semibold mb-4">Downloaded Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {downloads.map((video) => (
          <Link to={`/watch?v=${video.videoId}`} key={video.videoId} className="border p-2 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700">
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-48 object-cover rounded" />
            <p className="mt-2">{video.title}</p>
          </Link>
        ))}
        {downloads.length === 0 && <p>No downloads yet.</p>}
      </div>
    </div>
  );
};

export default DownloadsPage;
