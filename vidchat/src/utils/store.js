import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import chatSlice from "./chatSlice"
import searchSlice from "./searchSlice"
import categorySlice from "./categorySlice"
import searchHistorySlice from "./searchHistorySlice";
const store = configureStore({
    reducer:{
        app:appSlice,
        search: searchSlice,
        chat:chatSlice,
        category:categorySlice,
        searchHistory: searchHistorySlice,
    },
});

export default store;

