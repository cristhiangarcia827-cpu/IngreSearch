import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = {
  id: string;
  name: string;
  email: string;
};

type UiState = {
  mode: 'ahorro' | 'normal';
  currentUser: User | null;
  favorites: string[];
};

const initialState: UiState = {
  mode: 'normal',
  currentUser: null,
  favorites: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<'ahorro' | 'normal'>) {
      state.mode = action.payload;
    },
    toggleMode(state) {
      state.mode = state.mode === 'normal' ? 'ahorro' : 'normal';
    },
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
    },
    logoutUser(state) {
      state.currentUser = null;
      state.favorites = [];
    },
    addFavorite(state, action: PayloadAction<string>) {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
  },
});

export const { 
  setMode, 
  toggleMode, 
  setCurrentUser, 
  logoutUser,
  addFavorite, 
  removeFavorite 
} = uiSlice.actions;
export default uiSlice.reducer;