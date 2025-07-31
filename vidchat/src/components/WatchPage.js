import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GOOGLE_API_KEY } from '../utils/constants';
import CommentsContainer from './CommentContainer';
import LiveChat from './LiveChat';
import WatchShimmer from './WatchShimmer';
import Chatbot from './ChatBot';
import { auth, database, ref, push, set, onValue } from '../utils/firebase';
// Make sure this path is correct for your project structure
import { getGeminiResponse } from '../utils/geminiApi';

const WatchPage = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("v");
  const storedUser = JSON.parse(localStorage.getItem('yt-user'));

  // Existing State
  const [videoDetails, setVideoDetails] = useState(null);
  const [channelDetails, setChannelDetails] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // --- State for the Smart Summary feature ---
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);


  useEffect(() => {
    // Fetches video and channel details from the YouTube API
    async function fetchVideoData() {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${GOOGLE_API_KEY}`
        );
        const json = await res.json();
        const video = json.items?.[0];
        setVideoDetails(video);

        if (video) {
          const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${video?.snippet?.channelId}&key=${GOOGLE_API_KEY}`
          );
          const channelJson = await channelRes.json();
          setChannelDetails(channelJson.items?.[0]);
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    }
    fetchVideoData();
  }, [videoId]);


  // --- Handler to fetch the video summary from Gemini API ---
  const handleGetSummary = async () => {
    if (!videoDetails) return;
    
    setShowSummary(true);
    setIsSummaryLoading(true);
    setSummary(""); 

    const prompt = `Please provide a concise summary for the YouTube video titled "${videoDetails.snippet.title}" from the channel "${videoDetails.snippet.channelTitle}".`;
    
    try {
        const result = await getGeminiResponse(prompt);
        setSummary(result);
    } catch (error) {
        console.error("Failed to get summary:", error);
        setSummary("⚠️ Sorry, the summary could not be generated at this time.");
    } finally {
        setIsSummaryLoading(false);
    }
  };


  // --- Firebase useEffect hooks for user interactions (history, downloads, likes) ---
  useEffect(() => {
    if (storedUser?.uid && videoId && videoDetails) {
      const historyRef = ref(database, `users/${storedUser.uid}/watchHistory`);
      push(historyRef, {
        videoId: videoId,
        title: videoDetails?.snippet?.title || "",
        thumbnailUrl: videoDetails?.snippet?.thumbnails?.medium?.url || "",
        watchedAt: new Date().toISOString()
      });
    }
  }, [videoId, storedUser?.uid, videoDetails]);
  
  useEffect(() => {
    if (storedUser?.uid && videoId) {
      const downloadRef = ref(database, `downloads/${storedUser.uid}/${videoId}`);
      onValue(downloadRef, (snapshot) => {
        setIsDownloaded(!!snapshot.exists());
      });
    }
  }, [videoId, storedUser?.uid]);
  
  useEffect(() => {
    if (storedUser?.uid && videoId) {
      const likeRef = ref(database, `users/${storedUser.uid}/liked`);
      onValue(likeRef, (snapshot) => {
        const data = snapshot.val() || {};
        const found = Object.values(data).some(v => v.videoId === videoId);
        setIsLiked(found);
      });
    }
  }, [videoId, storedUser?.uid]);
  
  const handleLikeToggle = () => {
    if (!storedUser?.uid || !videoDetails) return;
    const likeRef = ref(database, `users/${storedUser.uid}/liked`);
    onValue(likeRef, (snapshot) => {
      const data = snapshot.val() || {};
      const entry = Object.entries(data).find(([, val]) => val.videoId === videoId);
      if (entry) {
        const [keyToDelete] = entry;
        set(ref(database, `users/${storedUser.uid}/liked/${keyToDelete}`), null);
        setIsLiked(false);
      } else {
        push(likeRef, {
          videoId,
          title: videoDetails.snippet.title,
          thumbnailUrl: videoDetails.snippet.thumbnails?.medium?.url || "",
          timestamp: Date.now()
        });
        setIsLiked(true);
      }
    }, { onlyOnce: true });
  };
  
  useEffect(() => {
    if (
      storedUser?.uid &&
      videoId &&
      videoDetails?.snippet?.title &&
      videoDetails?.snippet?.thumbnails?.medium?.url
    ) {
      const historyRef = ref(database, `users/${storedUser.uid}/history`);
      onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        const alreadyExists = data && Object.values(data).some(
          (item) => item.videoId === videoId
        );
        if (!alreadyExists) {
          push(historyRef, {
            videoId,
            title: videoDetails.snippet.title,
            thumbnailUrl: videoDetails.snippet.thumbnails.medium.url,
            timestamp: Date.now(),
          });
        }
      }, { onlyOnce: true });
    }
  }, [videoDetails, storedUser?.uid, videoId]);


  if (!videoDetails || !channelDetails) return <WatchShimmer />;

  return (
    <div className='flex flex-col pt-24 pb-10 px-6 w-full bg-white text-black dark:bg-gray-900 dark:text-white min-h-screen'>
      <div className='flex flex-col lg:flex-row w-full gap-6'>
        <div className={`flex flex-col w-full lg:w-[70%]`}>
          
          {/* --- STEP 1: This 'relative' container is the anchor for our overlay --- */}
          <div className="relative w-full rounded-lg shadow-md overflow-hidden">
            
            {/* --- STEP 2: This is the overlay. It only shows when 'showSummary' is true. --- */}
            {showSummary && (
              // This div is the dark background. It's positioned absolutely to cover the parent.
              <div 
                className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-20 transition-opacity duration-300 ease-in-out"
              >
                {/* This is the inner box that holds the content, making it look like a modal */}
                <div className="relative bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-600 w-full max-w-lg">
                    <button 
                      onClick={() => setShowSummary(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                      aria-label="Close summary"
                    >
                      X
                    </button>
                    <h3 className="text-xl font-bold mb-4 text-white text-center">✨ Smart Summary</h3>
                    <div className="text-center max-h-60 md:max-h-80 overflow-y-auto px-2 text-gray-300">
                      {isSummaryLoading ? (
                        <p>Generating summary, please wait... 🤖</p>
                      ) : (
                        <p className="text-base whitespace-pre-wrap">{summary}</p>
                      )}
                    </div>
                </div>
              </div>
            )}
            
            {/* --- STEP 3: The iframe sits underneath the overlay --- */}
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="rounded-lg" 
            ></iframe>
          </div>

          {/* Video Title */}
          <h1 className="mt-4 text-xl font-semibold">{videoDetails.snippet.title}</h1>

          {/* Channel Info and Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 w-full gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={channelDetails.snippet.thumbnails.default.url}
                alt="channel logo"
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{videoDetails.snippet.channelTitle}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {(Number(channelDetails.statistics.subscriberCount) / 1e6).toFixed(2)}M subscribers
                </p>
              </div>
              <button
                onClick={() => setSubscribed(!subscribed)}
                className={`ml-4 px-4 py-1 font-semibold rounded-full transition-all duration-200
                  ${subscribed ? 'bg-gray-300 text-black dark:bg-gray-700 dark:text-white' : 'bg-red-600 text-white hover:bg-red-700'}
                `}
              >
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                onClick={handleLikeToggle}
                className={`flex items-center px-3 py-1 rounded-full space-x-2 font-semibold cursor-pointer 
                  ${isLiked 
                  ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" 
                  : "bg-gray-100 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"}
                `}
              >
                <span>{isLiked ? "❤️" : "👍"}</span>
                <span>{Number(videoDetails?.statistics?.likeCount || 0).toLocaleString()}</span>
              </div>
              
              {/* --- Smart Summary Button --- */}
              <div 
                onClick={handleGetSummary}
                className="flex items-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-semibold px-4 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
              >
                ✨ Smart Summary
              </div>

              {/* Download Button */}
              <div
                onClick={() => {
                  if (!isDownloaded && storedUser?.uid) {
                    const downloadRef = ref(database, `downloads/${storedUser.uid}/${videoId}`);
                    set(downloadRef, {
                      videoId,
                      title: videoDetails.snippet.title,
                      thumbnailUrl: videoDetails.snippet.thumbnails?.medium?.url || "",
                      timestamp: Date.now()
                    });
                  }
                }}
                className={`flex items-center font-semibold px-4 py-1 rounded-full cursor-pointer
                  ${isDownloaded
                  ? 'bg-green-300 text-green-900 dark:bg-green-700 dark:text-green-100 cursor-not-allowed'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                  }`}
              >
                {isDownloaded ? '✅ Downloaded' : '⬇ Download'}
              </div>
              
              {/* Show/Hide Chat Button */}
              <div
                onClick={() => setShowLiveChat(!showLiveChat)}
                className="flex items-center bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-semibold px-4 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 cursor-pointer"
              >
                {showLiveChat ? '💬 Hide Chat' : '💬 Show Chat'}
              </div>
            </div>
          </div>

          {/* View Count and Date */}
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {Number(videoDetails.statistics.viewCount).toLocaleString()} views •{" "}
            {new Date(videoDetails.snippet.publishedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Right Column: Chatbot or Live Chat */}
        <div className="w-full lg:w-[30%]">
          {!showLiveChat && 
            <Chatbot videoTitle={videoDetails.snippet.title} videoId={videoId} channelTitle={videoDetails.snippet.channelTitle} />
          }
          {showLiveChat && <LiveChat />}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <CommentsContainer />
      </div>
    </div>
  );
};

export default WatchPage;
