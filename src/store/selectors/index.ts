import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

export const selectSearchState = (state: RootState) => state.search;
export const selectUiState = (state: RootState) => state.ui;
export const selectRecipesState = (state: RootState) => state.recipes;

export const selectAllRecipes = createSelector(
  [selectRecipesState],
  (recipes) => recipes.allRecipes
);

export const selectFilteredRecipeIds = createSelector(
  [selectRecipesState],
  (recipes) => recipes.filteredRecipes
);

export const selectFeaturedRecipeIds = createSelector(
  [selectRecipesState],
  (recipes) => recipes.featuredRecipes
);

export const selectSearchQuery = createSelector(
  [selectRecipesState],
  (recipes) => recipes.searchQuery
);

export const selectSelectedPrice = createSelector(
  [selectRecipesState],
  (recipes) => recipes.selectedPrice
);

export const selectSearchIngredients = createSelector(
  [selectSearchState],
  (search) => search.ingredients
);

export const selectSearchResults = createSelector(
  [selectSearchState],
  (search) => search.results
);

export const selectHasSearchResults = createSelector(
  [selectSearchResults],
  (results) => results.length > 0
);

export const selectCurrentUser = createSelector(
  [selectUiState],
  (ui) => ui.currentUser
);

export const selectIsLoggedIn = createSelector(
  [selectCurrentUser],
  (currentUser) => !!currentUser
);

export const selectUserName = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.name || ''
);

export const selectUserEmail = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.email || ''
);

export const selectUserId = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.id || ''
);

export const selectFavorites = createSelector(
  [selectUiState],
  (ui) => ui.favorites
);

export const selectFavoriteCount = createSelector(
  [selectFavorites],
  (favorites) => favorites.length
);

export const selectIsRecipeFavorite = (recipeId: string) => 
  createSelector(
    [selectFavorites],
    (favorites) => favorites.includes(recipeId)
  );

export const selectFavoriteRecipes = createSelector(
  [selectFavorites, selectAllRecipes],
  (favorites, allRecipes) => {
    return allRecipes.filter(recipe => favorites.includes(recipe.id));
  }
);

export const selectMode = createSelector(
  [selectUiState],
  (ui) => ui.mode
);

export const selectIsSavingsMode = createSelector(
  [selectMode],
  (mode) => mode === 'ahorro'
);

export const selectColorTheme = createSelector(
  [selectUiState],
  (ui) => ui.colorTheme
);

export const selectSystemColorScheme = createSelector(
  [selectUiState],
  (ui) => ui.systemColorScheme
);

export const selectLoadingFavorites = createSelector(
  [selectUiState],
  (ui) => ui.loadingFavorites
);

export const selectFavoriteError = createSelector(
  [selectUiState],
  (ui) => ui.favoriteError
);

export const selectFilteredRecipes = createSelector(
  [selectAllRecipes, selectFilteredRecipeIds],
  (allRecipes, filteredIds) => {
    if (filteredIds.length === 0) return [];
    return allRecipes.filter(recipe => filteredIds.includes(recipe.id));
  }
);

export const selectFeaturedRecipes = createSelector(
  [selectAllRecipes, selectFeaturedRecipeIds],
  (allRecipes, featuredIds) => {
    return allRecipes.filter(recipe => featuredIds.includes(recipe.id));
  }
);

export const selectRecipesScreenData = createSelector(
  [selectSearchIngredients, selectSearchResults, selectMode, selectCurrentUser, selectFavorites],
  (ingredients, results, mode, currentUser, favorites) => ({
    ingredients,
    results,
    mode,
    currentUser,
    favorites,
    isLoggedIn: !!currentUser,
    favoriteCount: favorites.length
  })
);

export const selectSearchScreenData = createSelector(
  [selectSearchIngredients, selectMode, selectCurrentUser],
  (ingredients, mode, currentUser) => ({
    ingredients,
    mode,
    currentUser,
    isLoggedIn: !!currentUser
  })
);

export const selectHomeScreenData = createSelector(
  [selectCurrentUser, selectMode, selectFeaturedRecipes],
  (currentUser, mode, featuredRecipes) => ({
    currentUser,
    mode,
    featuredRecipes,
    isLoggedIn: !!currentUser
  })
);

export const selectProfileScreenData = createSelector(
  [selectCurrentUser, selectFavorites, selectMode, selectColorTheme],
  (currentUser, favorites, mode, colorTheme) => ({
    currentUser,
    favorites,
    favoriteCount: favorites.length,
    mode,
    colorTheme,
    isLoggedIn: !!currentUser,
    isSavingsMode: mode === 'ahorro'
  })
);