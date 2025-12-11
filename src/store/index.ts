import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';
import recipesReducer from './slices/recipesSlice';


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['ui'],
  timeout: 10000,
  serialize: true,
  deserialize: true,
};

const rootReducer = combineReducers({
  search: searchReducer,
  ui: uiReducer,
  recipes: recipesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
      immutableCheck: {
        warnAfter: 100,
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from './selectors';