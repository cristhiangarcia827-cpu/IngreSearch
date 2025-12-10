import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import { ColorTheme } from '../../theme/colors';

type User = {
  id: string;
  name: string;
  email: string;
};

type UiState = {
  mode: 'ahorro' | 'normal';
  currentUser: User | null;
  favorites: string[];
  loadingFavorites: boolean;
  favoriteError: string | null;
  colorTheme: ColorTheme;
  systemColorScheme: 'light' | 'dark';
};

const initialState: UiState = {
  mode: 'normal',
  currentUser: null,
  favorites: [],
  loadingFavorites: false,
  favoriteError: null,
  colorTheme: 'system',
  systemColorScheme: 'light',
};

// Thunk para cargar favoritos desde Supabase
export const loadFavorites = createAsyncThunk(
  'ui/loadFavorites',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }
      
      return data.map(item => item.recipe_id);
    } catch (error) {
      return rejectWithValue('Error al cargar favoritos');
    }
  }
);

// Thunk para agregar favorito
export const addFavoriteToDB = createAsyncThunk(
  'ui/addFavoriteToDB',
  async ({ userId, recipeId }: { userId: string; recipeId: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{ 
          user_id: userId, 
          recipe_id: recipeId,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        return rejectWithValue(error.message);
      }
      
      return recipeId;
    } catch (error) {
      return rejectWithValue('Error al agregar favorito');
    }
  }
);

// Thunk para remover favorito
export const removeFavoriteFromDB = createAsyncThunk(
  'ui/removeFavoriteFromDB',
  async ({ userId, recipeId }: { userId: string; recipeId: string }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) {
        return rejectWithValue(error.message);
      }
      
      return recipeId;
    } catch (error) {
      return rejectWithValue('Error al remover favorito');
    }
  }
);

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
      state.favorites = [];
      state.favoriteError = null;
    },
    logoutUser(state) {
      state.currentUser = null;
      state.favorites = [];
      state.favoriteError = null;
    },
    clearFavoriteError(state) {
      state.favoriteError = null;
    },
    // Nuevas acciones para tema
    setColorTheme(state, action: PayloadAction<ColorTheme>) {
      state.colorTheme = action.payload;
    },
    toggleColorTheme(state) {
      if (state.colorTheme === 'system') {
        state.colorTheme = 'light';
      } else if (state.colorTheme === 'light') {
        state.colorTheme = 'dark';
      } else {
        state.colorTheme = 'system';
      }
    },
    setSystemColorScheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.systemColorScheme = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cargar favoritos
      .addCase(loadFavorites.pending, (state) => {
        state.loadingFavorites = true;
        state.favoriteError = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
        state.loadingFavorites = false;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loadingFavorites = false;
        state.favoriteError = action.payload as string;
        state.favorites = [];
      })
      // Agregar favorito
      .addCase(addFavoriteToDB.pending, (state) => {
        state.favoriteError = null;
      })
      .addCase(addFavoriteToDB.fulfilled, (state, action) => {
        if (!state.favorites.includes(action.payload)) {
          state.favorites.push(action.payload);
        }
      })
      .addCase(addFavoriteToDB.rejected, (state, action) => {
        state.favoriteError = action.payload as string;
      })
      // Remover favorito
      .addCase(removeFavoriteFromDB.pending, (state) => {
        state.favoriteError = null;
      })
      .addCase(removeFavoriteFromDB.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(id => id !== action.payload);
      })
      .addCase(removeFavoriteFromDB.rejected, (state, action) => {
        state.favoriteError = action.payload as string;
      });
  },
});

export const { 
  setMode, 
  toggleMode, 
  setCurrentUser, 
  logoutUser,
  clearFavoriteError,
  setColorTheme,
  toggleColorTheme,
  setSystemColorScheme,
} = uiSlice.actions;

export default uiSlice.reducer;