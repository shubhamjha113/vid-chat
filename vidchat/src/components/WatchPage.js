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

// --- Custom CSS for advanced animations and styling ---
const customStyles = `
  @keyframes enter-animation {
    0% {
      opacity: 0;
      transform: translateY(-50px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes exit-animation {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.9);
    }
  }

  .summary-enter {
    animation: enter-animation 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .summary-exit {
    animation: exit-animation 0.3s ease-out forwards;
  }
  
  @keyframes aurora-animation {
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
  }

  .aurora-background {
    background: linear-gradient(-45deg, #0f172a, #1e293b, #334155, #475569);
    background-size: 400% 400%;
    animation: aurora-animation 15s ease infinite;
  }

  @keyframes title-glow {
    0%, 100% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0077ff, 0 0 20px #0077ff; }
    50% { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0077ff, 0 0 40px #0077ff; }
  }

  .title-glow-animate {
    animation: title-glow 3s ease-in-out infinite;
  }
`;


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
  const [isExiting, setIsExiting] = useState(false);


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
    setIsExiting(false);
    setIsSummaryLoading(true);
    setSummary(""); 

    const prompt = `Generate a captivating summary for the YouTube video titled '${videoDetails.snippet.title}' from the channel '${videoDetails.snippet.channelTitle}'. Please present it as a few key bullet points, each starting with a relevant emoji. Make it sound exciting and engaging.`;
    
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

  // --- Handler to close the summary with animation ---
  const handleCloseSummary = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowSummary(false);
    }, 300); 
  };


  // --- Firebase useEffect hooks (unchanged) ---
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
    <>
      <style>{customStyles}</style>
      <div className='flex flex-col pt-24 pb-10 px-6 w-full bg-white text-black dark:bg-gray-900 dark:text-white min-h-screen'>
        <div className='flex flex-col lg:flex-row w-full gap-6'>
          <div className={`flex flex-col w-full lg:w-[70%]`}>
            
            <div className="relative w-full rounded-lg shadow-md overflow-hidden">
              
              {/* --- CORRECTED: Summary Overlay with Repositioned Close Button --- */}
              {showSummary && (
                <div 
                  // The main overlay with the blurred background
                  className="absolute inset-0 flex flex-col items-center justify-center p-4 z-30 backdrop-blur-sm bg-black/50"
                >
                  {/* --- CORRECTED: Close button is now a sibling to the modal, positioned at the top right of the screen area --- */}
                  <button 
                    onClick={handleCloseSummary}
                    className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl transition-transform duration-200 hover:scale-110 shadow-lg z-40"
                    aria-label="Close summary"
                  >
                    &times;
                  </button>

                  {/* The animated modal itself */}
                  <div className={`w-full max-w-lg p-1 rounded-2xl shadow-2xl aurora-background ${isExiting ? 'summary-exit' : 'summary-enter'}`}>
                      <div className="relative bg-slate-900/80 p-6 rounded-xl">
                          <h3 className="text-2xl font-bold mb-5 text-white text-center title-glow-animate">✨ Smart Summary ✨</h3>
                          <div className="text-left max-h-60 md:max-h-80 overflow-y-auto px-2 text-gray-200 space-y-3">
                            {isSummaryLoading ? (
                              <div className="flex justify-center items-center h-24">
                                <p className="animate-pulse text-lg">Generating summary... 🤖</p>
                              </div>
                            ) : (
                              <p className="text-base whitespace-pre-wrap leading-relaxed">{summary}</p>
                            )}
                          </div>
                      </div>
                  </div>
                </div>
              )}
              
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
                
                <div 
                  onClick={handleGetSummary}
                  className="flex items-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-semibold px-4 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
                >
                  ✨ Smart Summary
                </div>

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
                
                <div
                  onClick={() => setShowLiveChat(!showLiveChat)}
                  className="flex items-center bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-semibold px-4 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 cursor-pointer"
                >
                  {showLiveChat ? '💬 Hide Chat' : '💬 Show Chat'}
                </div>
              </div>
            </div>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {Number(videoDetails.statistics.viewCount).toLocaleString()} views •{" "}
              {new Date(videoDetails.snippet.publishedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="w-full lg:w-[30%]">
            {!showLiveChat && 
              <Chatbot videoTitle={videoDetails.snippet.title} videoId={videoId} channelTitle={videoDetails.snippet.channelTitle} />
            }
            {showLiveChat && <LiveChat />}
          </div>
        </div>

        <div className="mt-6">
          <CommentsContainer />
        </div>
      </div>
    </>
  );
};

export default WatchPage;
