import { createSlice } from '@reduxjs/toolkit';

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    selectedCategory: { name: 'All', categoryId: null },
  },
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = {
        name: action.payload.name,
        categoryId: action.payload.categoryId,
      };
    },
  },
});

export const { setCategory } = categorySlice.actions;
export default categorySlice.reducer;
