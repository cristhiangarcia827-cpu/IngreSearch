import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UiState = {
  mode: 'ahorro' | 'normal';
};

const initialState: UiState = {
  mode: 'normal',
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
  },
});

export const { setMode, toggleMode } = uiSlice.actions;
export default uiSlice.reducer;
