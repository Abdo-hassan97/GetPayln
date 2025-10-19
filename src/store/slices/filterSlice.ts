import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  category: string | null;
}

const initialState: FilterState = {
  category: null,
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string | null>) {
      state.category = action.payload;
    },
  },
});

export const { setCategory } = filterSlice.actions;
export default filterSlice.reducer;
