import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMenu } from '../utils/appSlice';
import { YOUTUBE_SEARCH_API } from '../utils/constants';
import { cacheResults } from '../utils/searchSlice';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import VoiceModal from './VoiceModal';
import { auth, provider, signInWithPopup, signOut ,database,ref,push, set, onValue} from '../utils/firebase';
import { FaGoogle } from "react-icons/fa";


const Head = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const searchCache = useSelector((store) => store.search);

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Your browser does not support voice search');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      handleSearch(transcript);
      setShowModal(false);
    };

    recognition.onerror = () => setShowModal(false);

    recognition.start();
    setShowModal(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setSuggestions([]);
        return;
      }
      if (searchCache[searchQuery]) {
        setSuggestions(searchCache[searchQuery]);
      } else {
        getSearchSuggestions();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getSearchSuggestions = async () => {
    const data = await fetch(YOUTUBE_SEARCH_API + searchQuery);
    const json = await data.json();
    setSuggestions(json[1]);
    dispatch(cacheResults({ [searchQuery]: json[1] }));
  };

  const handleSearch = (query) => {
    if (!query.trim()) return;

    if (!searchHistory.includes(query)) {
      setSearchHistory((prev) => [query, ...prev.slice(0, 4)]);
    }

    // ✅ Save search to Realtime Database
    if (user) {
      const searchRef = ref(database, `users/${user.uid}/searchHistory`);
      push(searchRef, {
        query,
        timestamp: new Date().toISOString()
      });
    }

    navigate(`/results?search_query=${query}`);
    setSearchQuery(query);
    setShowSuggestions(false);
  };

  const clearHistory = () => {
  setSearchHistory([]);
  if (user) {
    const searchRef = ref(database, `users/${user.uid}/searchHistory`);
    set(searchRef, null); // ✅ Deletes all history under the user node
  }
};


  const toggleMenuHandler = () => dispatch(toggleMenu());

  // Fetch user on mount (optional if you want to persist login)
  useEffect(() => {
  const storedUser = localStorage.getItem('yt-user');
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // ✅ Fetch search history from Firebase
    const searchRef = ref(database, `users/${parsedUser.uid}/searchHistory`);
    onValue(searchRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const searches = Object.values(data)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map(item => item.query);
        setSearchHistory(searches.slice(0, 5)); // Limit to 5 recent queries
      }
    });
  }
}, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      localStorage.setItem('yt-user', JSON.stringify(result.user));

      // ✅ Save user info to Realtime Database
      const userRef = ref(database, 'users/' + result.user.uid);
      await set(userRef, {
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString(),
      });

    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('yt-user');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 grid grid-cols-12 p-4 shadow-md bg-white text-black dark:bg-gray-900 dark:text-white items-center">
      {/* Left - Logo & Menu */}
      <div className="flex col-span-2 items-center">
        <img
          onClick={toggleMenuHandler}
          className="h-10 mr-4 cursor-pointer"
          src={darkMode ? '/images/hamburger-dark.jpg' : '/images/menu.png'}
          alt="menu"
        />
        <a href="/">
          <img
            className="h-12 dark:h-18 dark:w-26"
            src={darkMode ? '/images/darklogo.png' : '/images/lightlogo.png'}
            alt="logo"
          />
        </a>
      </div>

      {/* Middle - Search Section */}
      <div className="col-span-7 flex justify-center items-center">
        <div className="relative w-full max-w-xl">
          <div className="flex items-center rounded-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800">
              <input
              type="text"
              className="w-full px-4 py-2 rounded-l-full text-black dark:text-white bg-transparent focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 150)}
              placeholder="Search"
              />

            {searchQuery && (
              <button
                className="mr-2 text-lg text-pink-600 hover:text-red-600"
                onClick={() => setSearchQuery('')}
              >
                ❌
              </button>
            )}

            <button
              className="px-3 py-2 rounded-r-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => handleSearch(searchQuery)}
            >
              🔍
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {/* Replace your suggestions dropdown block with this updated one */}
            {isInputFocused && (
            <div className="absolute top-12 left-0 w-full bg-white dark:bg-gray-800 py-2 px-2 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700 z-50">
              {searchQuery.trim() === '' && searchHistory.length > 0 && (
                <div className="mb-2 border-b pb-2">
                  <div className="flex justify-between items-center px-2 text-xs text-gray-600 dark:text-gray-300">
                    <span>Recent Searches</span>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        clearHistory();
                      }}
                      className="text-red-600 dark:text-red-400 text-xs hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <ul>
                    {searchHistory.map((item, index) => (
                      <li
                        key={`history-${index}`}
                        className="py-1 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                        onMouseDown={() => handleSearch(item)}
                      >
                        🕒 {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {searchQuery.trim() !== '' &&
                suggestions.map((s, i) => (
                  <li
                    key={`suggestion-${i}`}
                    className="py-2 px-3 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                    onMouseDown={() => handleSearch(s)}
                  >
                    🔍 {s}
                  </li>
                ))}
            </div>
            )}

        </div>

        {/* Mic icon outside input */}
        <button
          className="ml-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          onClick={handleVoiceSearch}
        >
          🎤
        </button>

        {showModal && <VoiceModal onClose={() => setShowModal(false)} />}
      </div>

      {/* Right - Icons */}
      <div className="col-span-3 flex items-center justify-end gap-4 pr-4">


        <button className="text-xl h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">📹</button>
        <button className="text-xl h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">🔔</button>
        <button
          className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-sm rounded-full"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>


        {user ? (
          <button
            onClick={handleLogout}
            className="px-4 py-1 bg-fuchsia-600 text-white rounded-full hover:bg-red-600 transition"
          >
            Log out
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center px-4 py-1 bg-teal-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            <FaGoogle className='mr-2' /> Sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default Head;
