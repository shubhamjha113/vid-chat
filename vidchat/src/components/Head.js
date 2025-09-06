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
import { getGeminiResponse } from '../utils/geminiApi';

const Head = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  //for trending topic details 
  const [isTopicsVisible, setIsTopicsVisible] = useState(false);
  // State to hold both lists, loading, and error status
  const [trendingTopics, setTrendingTopics] = useState({ world: [], india: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const searchCache = useSelector((store) => store.search);

  
   // --- MODIFIED: Logic for fetching topics ---
  const fetchTrendingTopics = async () => {
    if (trendingTopics.world.length > 0) {
      setIsTopicsVisible(!isTopicsVisible);
      return;
    }

    setIsTopicsVisible(true);
    setIsLoading(true);
    setError(null);

    const prompt = `Based on the current date (${new Date().toLocaleDateString()}), provide the top 5 trending topics in the world and the top 5 trending topics in India. These topics should be short, engaging, and suitable for a video platform audience. Return your response ONLY as a single, valid JSON object. The object must have two keys: "world" and "india". Each key should contain an array of 5 topic strings.`;

    try {
      const response = await getGeminiResponse(prompt);
      const jsonString = response.replace(/```json|```/g, '').trim();
      const parsedTopics = JSON.parse(jsonString);
      setTrendingTopics(parsedTopics);
    } catch (e) {
      console.error("Failed to parse or fetch topics:", e);
      setError("Could not load topics.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- MODIFIED: Makes the topics clickable and searchable ---
  const handleTopicClick = (topic) => {
    setSearchQuery(topic);
    handleSearch(topic);
    setIsTopicsVisible(false);
  };

  // --- ADDED: The CORRECT way to console.log state after it updates ---
  useEffect(() => {
    // This will only run when the `trendingTopics` state *actually* changes.
    if (trendingTopics.world.length > 0) {
      console.log("✅ Trending Topics state has been updated:", trendingTopics);
    }
  }, [trendingTopics]);

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
      {/* Right - Icons */}
<div className="col-span-3 flex items-center justify-end pr-4">
  {/* ✅ NEW: A dedicated container for all buttons to ensure consistent spacing */}
  <div className="flex items-center gap-4">

    {/* Hot Topics Button */}
    <div className="relative">
      <button
        onClick={fetchTrendingTopics}
        className="px-4 py-1 bg-fuchsia-600 text-white rounded-full hover:bg-red-600 transition"
      >
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : isTopicsVisible ? (
          "Close Topics"
        ) : (
          "Hot Topics 🔥"
        )}
      </button>

      {/* The dropdown menu for topics */}
      {isTopicsVisible && (
        <div 
          className="absolute right-0 mt-2 w-96 origin-top-right rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl border border-black/10 dark:border-white/10 z-50 transition-all duration-300 ease-in-out transform opacity-100 scale-100"
        >
          {/* ... all your existing dropdown content ... */}
          {!isLoading && !error && (
            <>
              {/* --- World Topics --- */}
              <div className="p-4">
                <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 mb-2">
                  Top 5 in the World 🌍
                </h3>
                <ul>
                  {trendingTopics.world.map((topic, index) => (
                    <li key={`world-${index}`}>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleTopicClick(topic); }}
                        className="flex items-center p-2 rounded-lg transition-all duration-200 ease-in-out group hover:bg-sky-100/50 dark:hover:bg-sky-900/20 hover:pl-4"
                      >
                        <span className="flex items-center justify-center h-6 w-6 mr-3 text-xs font-bold text-sky-800 dark:text-sky-200 bg-sky-200 dark:bg-sky-900/50 rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                          {topic}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-black/5 dark:border-white/5 mx-4"></div>
              
              {/* --- India Topics --- */}
              <div className="p-4">
                <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-400 mb-2">
                  Top 5 in India
                </h3>
                <ul>
                  {trendingTopics.india.map((topic, index) => (
                    <li key={`india-${index}`}>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleTopicClick(topic); }}
                        className="flex items-center p-2 rounded-lg transition-all duration-200 ease-in-out group hover:bg-orange-100/50 dark:hover:bg-orange-900/20 hover:pl-4"
                      >
                        <span className="flex items-center justify-center h-6 w-6 mr-3 text-xs font-bold text-orange-800 dark:text-orange-200 bg-orange-200 dark:bg-orange-900/50 rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                          {topic}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          {isLoading && <p className="p-4 text-center text-gray-500 animate-pulse">Fetching trends...</p>}
          {error && <p className="p-4 text-center text-red-500">{error}</p>}
        </div>
      )}
    </div>

    {/* Light/Dark Mode Button */}
    <button
      className="px-3 py-1 bg-fuchsia-600 text-white rounded-full hover:bg-red-600 transition"
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode ? '🌙 Dark' : '☀️ Light'}
    </button>

    {/* Login/Logout Button */}
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
    </div>
  );
};

export default Head;
