
import { Provider } from 'react-redux';
import './App.css';
import Body from './components/Body';
import store from './utils/store';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainContainer from './components/MainContainer';
import WatchPage from './components/WatchPage';
import SearchResults from './components/SearchResults';
import { ThemeProvider } from './components/ThemeContext';
import ShortsPage from './components/ShortsPage';
import TrendingPage from './components/TrendingPage';
import DownloadsPage from './components/DownloadsPage';
import LikedVideos from './components/LikedVideos';
import History from "./components/History"


const appRouter = createBrowserRouter([{
    path: "/",
    element: <Body />,
    children: [
      {
        path: "/",
        element: <MainContainer />,
      },
      {
        path: "watch",
        element: <WatchPage />,
      },
      {
        path: "results",
        element: <SearchResults />,
      },
      {
         path: "shorts", 
         element: <ShortsPage /> 
      },
      { 
         path: "trending", 
         element: <TrendingPage /> 
      },
      {
        path:"downloads",
        element:<DownloadsPage/>
      },
      {
        path:"liked",
        element:<LikedVideos/>
      },
      {
        path:"history",
        element:<History/>
      },
      
    
    ]
}])



function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <div >      
          <RouterProvider router={appRouter}/>      
        </div>
        </ThemeProvider>  
    </Provider>
  );
}

export default App;
