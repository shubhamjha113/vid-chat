import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';

const Sidebar = () => {

  const isMenuOpen = useSelector(store => store.app.isMenuOpen);

  if(!isMenuOpen) return null; //early return pattern
  return (
    <div className='p-5 shadow-lg w-48 pt-24 bg-white dark:bg-gray-800 text-black dark:text-white min-h-screen'>
      <ul >
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"><Link to="/">🏠 Home</Link> </li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">
           <Link to="/shorts">🎬 Shorts</Link>
          </li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 w-40">
          <Link to="/trending">📈Trending</Link>
        </li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">
          <Link to="/downloads">⬇️ Downloads</Link>
        </li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">
          <Link to="/liked">❤️ Liked Video</Link>
        </li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">
          <Link to="/history">🕒 History</Link>
        </li>

      </ul>
      <h1 className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Subscriptions</h1>
      <ul>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">🎵 Music</li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">🏅 Sports</li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">🎮 Gaming</li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">🎥 Movies</li>

      </ul>
      <h1 className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Explore</h1>
      <ul>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">📚 Library</li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">🕒 History</li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 py-1">📘 Learning</li>
        <li className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1">💡Live</li>

      </ul>
    </div>
  )
}

export default Sidebar
