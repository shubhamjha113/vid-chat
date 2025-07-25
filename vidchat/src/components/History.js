import React, { useEffect, useState } from 'react';
import { database, ref, onValue } from '../utils/firebase';
import { Link } from 'react-router-dom';

const History = () => {
  const storedUser = JSON.parse(localStorage.getItem('yt-user'));
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (storedUser?.uid) {
      const historyRef = ref(database, `users/${storedUser.uid}/history`);
      onValue(historyRef, (snapshot) => {
        const data = snapshot.val() || {};
        const list = Object.values(data).reverse(); // newest first
        setHistory(list);
      });
    }
  }, [storedUser?.uid]);

  if (!storedUser) {
    return <p className="p-4 text-red-600">Please sign in to view history.</p>;
  }

  return (
    <div className="p-6 pt-24 bg-white dark:bg-gray-900 min-h-screen text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">📜 Watch History</h1>
      {history.length === 0 ? (
        <p>No watch history yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((video, idx) => (
            <Link
              key={idx}
              to={`/watch?v=${video.videoId}`}
              className="border rounded-lg overflow-hidden shadow hover:shadow-md dark:border-gray-700"
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <h2 className="text-lg font-semibold">{video.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
