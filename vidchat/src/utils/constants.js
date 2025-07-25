export const GOOGLE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

 export const YOUTUBE_API_KEY = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=IN&key="+GOOGLE_API_KEY;

export const YOUTUBE_SEARCH_API = "https://vid-chat-v69j.onrender.com/api/suggestions?q=";



//export const YOUTUBE_SEARCH_API =
  //"https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=";

  export const LIVE_CHAT_COUNT=25;

  export const YOUTUBE_SEARCH_RESULTS_API =
  "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&key="+ GOOGLE_API_KEY;
export const SHORTS_URL = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=shorts&type=video&videoDuration=short&regionCode=IN&key="+GOOGLE_API_KEY;

//export const TRENDING_API = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=IN&maxResults=50key=" + GOOGLE_API_KEY;

