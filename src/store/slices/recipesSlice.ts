import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../../data/recipes';
import { RECIPES } from '../../data/recipes';

type RecipesState = {
  allRecipes: Recipe[];
  filteredRecipes: string[];
  featuredRecipes: string[];
  searchQuery: string;
  selectedPrice: ('bajo' | 'medio' | 'alto')[];
};

const initialState: RecipesState = {
  allRecipes: RECIPES,
  filteredRecipes: [],
  featuredRecipes: RECIPES.slice(0, 3).map(r => r.id),
  searchQuery: '',
  selectedPrice: [],
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setFilteredRecipes: (state, action: PayloadAction<string[]>) => {
      state.filteredRecipes = action.payload;
    },
    
    clearFilteredRecipes: (state) => {
      state.filteredRecipes = [];
    },
    
    setFeaturedRecipes: (state, action: PayloadAction<string[]>) => {
      state.featuredRecipes = action.payload;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
    
    setSelectedPrice: (state, action: PayloadAction<('bajo' | 'medio' | 'alto')[]>) => {
      state.selectedPrice = action.payload;
    },
    
    addPriceFilter: (state, action: PayloadAction<'bajo' | 'medio' | 'alto'>) => {
      if (!state.selectedPrice.includes(action.payload)) {
        state.selectedPrice.push(action.payload);
      }
    },
    
    removePriceFilter: (state, action: PayloadAction<'bajo' | 'medio' | 'alto'>) => {
      state.selectedPrice = state.selectedPrice.filter(price => price !== action.payload);
    },
    
    clearPriceFilters: (state) => {
      state.selectedPrice = [];
    },
    
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.allRecipes.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.allRecipes[index] = action.payload;
      }
    },
    
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      const exists = state.allRecipes.some(r => r.id === action.payload.id);
      if (!exists) {
        state.allRecipes.unshift(action.payload);
      }
    },
    
    removeRecipe: (state, action: PayloadAction<string>) => {
      state.allRecipes = state.allRecipes.filter(r => r.id !== action.payload);
      state.filteredRecipes = state.filteredRecipes.filter(id => id !== action.payload);
      state.featuredRecipes = state.featuredRecipes.filter(id => id !== action.payload);
    },
    
    filterRecipes: (state, action: PayloadAction<{
      ingredients?: string;
      priceFilters?: ('bajo' | 'medio' | 'alto')[];
      mode?: 'ahorro' | 'normal';
    }>) => {
      const { ingredients = '', priceFilters = [], mode = 'normal' } = action.payload;
      
      const filtered = state.allRecipes.filter(recipe => {
        if (ingredients.trim()) {
          const query = ingredients.toLowerCase();
          const matchesSearch = 
            recipe.title.toLowerCase().includes(query) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
          
          if (!matchesSearch) return false;
        }

        if (priceFilters.length > 0 && !priceFilters.includes(recipe.priceTag)) {
          return false;
        }

        if (mode === 'ahorro' && recipe.priceTag !== 'bajo') {
          return false;
        }

        return true;
      });

      state.filteredRecipes = filtered.map(r => r.id);
      state.searchQuery = ingredients;
      state.selectedPrice = priceFilters;
    },
    
    resetAllFilters: (state) => {
      state.filteredRecipes = [];
      state.searchQuery = '';
      state.selectedPrice = [];
    },
  },
});

export const {
  setFilteredRecipes,
  clearFilteredRecipes,
  setFeaturedRecipes,
  setSearchQuery,
  clearSearchQuery,
  setSelectedPrice,
  addPriceFilter,
  removePriceFilter,
  clearPriceFilters,
  updateRecipe,
  addRecipe,
  removeRecipe,
  filterRecipes,
  resetAllFilters,
} = recipesSlice.actions;

export default recipesSlice.reducer;