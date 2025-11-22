import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SearchState = {
  ingredients: string;
  results: string[]; 
};

const initialState: SearchState = {
  ingredients: '',
  results: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setIngredients(state, action: PayloadAction<string>) {
      state.ingredients = action.payload;
    },
    setResults(state, action: PayloadAction<string[]>) {
      state.results = action.payload;
    },
    clearResults(state) {
      state.results = [];
    },
  },
});

export const { setIngredients, setResults, clearResults } = searchSlice.actions;
export default searchSlice.reducer;
