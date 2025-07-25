import { createSlice } from "@reduxjs/toolkit";

const searchHistorySlice = createSlice({
  name: 'searchHistory',
  initialState: [],
  reducers: {
    addSearchQuery: (state, action) => {
      const query = action.payload;
      const index = state.indexOf(query);
      if (index !== -1) state.splice(index, 1);
      state.unshift(query);
      if (state.length > 10) state.pop(); // Max 10 items
    },
    clearSearchHistory: () => {
      return [];
    },
  },
});

export const { addSearchQuery, clearSearchHistory } = searchHistorySlice.actions;
export default searchHistorySlice.reducer;
