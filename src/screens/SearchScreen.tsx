import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import RecipeCard from '../components/RecipeCard';
import FilterChip from '../components/FilterChip';
import { useTheme } from '../hooks/useTheme';
import { RECIPES } from '../data/recipes';
import { RootStackParamList } from '../navigation/RootNavigator';
import { TabsParamList } from '../navigation/TabsNavigator';
import { setIngredients, setResults } from '../store/slices/searchSlice';
import { loadFavorites } from '../store/slices/uiSlice';
import type { RootState, AppDispatch } from '../store';

type SearchScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'Tabs'>,
  BottomTabNavigationProp<TabsParamList>
>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, themeColor, backgroundColor } = useTheme();
  const searchState = useSelector((state: RootState) => state.search);
  const mode = useSelector((state: RootState) => state.ui.mode);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  const [searchQuery, setSearchQuery] = useState(searchState.ingredients);
  const [selectedPrice, setSelectedPrice] = useState<('bajo' | 'medio' | 'alto')[]>([]);
  const priceOptions: ('bajo' | 'medio' | 'alto')[] = ['bajo', 'medio', 'alto'];

  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  const filteredRecipes = useMemo(() => {
    return RECIPES.filter(recipe => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          recipe.title.toLowerCase().includes(query) ||
          recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      if (selectedPrice.length > 0 && !selectedPrice.includes(recipe.priceTag)) {
        return false;
      }

      if (mode === 'ahorro' && recipe.priceTag !== 'bajo') {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedPrice, mode]);

  const togglePriceFilter = useCallback((price: 'bajo' | 'medio' | 'alto') => {
    setSelectedPrice(prev => 
      prev.includes(price) 
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() && selectedPrice.length === 0) {
      Alert.alert(
        'Búsqueda vacía',
        'Ingresa algún ingrediente o selecciona un filtro para buscar.'
      );
      return;
    }

    dispatch(setIngredients(searchQuery));
    dispatch(setResults(filteredRecipes.map(r => r.id)));
    
    navigation.navigate('Tabs', { screen: 'Recetas' } as any);
  }, [searchQuery, selectedPrice, filteredRecipes, dispatch, navigation]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedPrice([]);
    dispatch(setIngredients(''));
    dispatch(setResults([]));
  }, [dispatch]);

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: RECIPES.find(r => r.id === recipeId)?.title
    });
  }, [navigation]);

  const handleQuickSearch = useCallback((ingredient: string) => {
    setSearchQuery(prev => {
      const current = prev.trim();
      if (current === '') return ingredient;
      return `${current}, ${ingredient}`;
    });
  }, []);

  const commonIngredients = ['arroz', 'huevo', 'tomate', 'pasta', 'ajo', 'lechuga', 'pollo'];
  const hasActiveFilters = searchQuery.trim() !== '' || selectedPrice.length > 0;

  const getPriceColor = useCallback((price: 'bajo' | 'medio' | 'alto') => {
    switch(price) {
      case 'bajo': return colors.savingsPrimary;
      case 'medio': return colors.primary;
      case 'alto': return '#8A2BE2';
      default: return colors.primary;
    }
  }, [colors]);

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <SectionTitle 
            text="Buscar Recetas" 
            color={themeColor}
            align="left"
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.searchSection}>
          <CustomInput
            placeholder="Ej: arroz, huevo, tomate..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
          <CustomButton
            text="Buscar"
            onPress={handleSearch}
            variant={mode === 'ahorro' ? 'savings' : 'primary'}
            style={styles.searchButton}
          />
        </View>

        <View style={[styles.quickSearchSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColor }]}>
            Ingredientes comunes
          </Text>
          <View style={styles.quickSearchContainer}>
            {commonIngredients.map(ingredient => (
              <TouchableOpacity
                key={ingredient}
                style={[
                  styles.quickSearchChip,
                  { backgroundColor: themeColor + '20', borderColor: themeColor }
                ]}
                onPress={() => handleQuickSearch(ingredient)}
              >
                <Text style={[styles.quickSearchText, { color: themeColor }]}>
                  {ingredient}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.filterSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColor }]}>
            Filtro por Precio
          </Text>
          <View style={styles.filterOptions}>
            {priceOptions.map(price => {
              const isSelected = selectedPrice.includes(price);
              const priceColor = getPriceColor(price);
              
              return (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipSelected,
                    { 
                      borderColor: priceColor,
                      backgroundColor: isSelected ? priceColor : 'transparent'
                    }
                  ]}
                  onPress={() => togglePriceFilter(price)}
                >
                  <Text style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                    { color: isSelected ? '#fff' : priceColor }
                  ]}>
                    {price.charAt(0).toUpperCase() + price.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.resultsSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.resultsHeader}>
            <Text style={[styles.sectionTitle, { color: themeColor }]}>
              Resultados ({filteredRecipes.length})
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.clearButton, { color: themeColor }]}>
                  Limpiar filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {hasActiveFilters && (
            <View style={styles.activeFilters}>
              {searchQuery.trim() && (
                <FilterChip
                  label={`Buscar: ${searchQuery}`}
                  icon="search"
                  color={themeColor}
                  onRemove={() => setSearchQuery('')}
                />
              )}
              {selectedPrice.map(price => (
                <FilterChip
                  key={price}
                  label={`Precio: ${price}`}
                  icon="pricetag"
                  color={getPriceColor(price)}
                  onRemove={() => setSelectedPrice(prev => prev.filter(p => p !== price))}
                />
              ))}
            </View>
          )}

          {filteredRecipes.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                {hasActiveFilters 
                  ? 'No se encontraron recetas con esos criterios'
                  : 'Ingresa ingredientes para buscar recetas'}
              </Text>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {filteredRecipes.slice(0, 5).map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  priceTag={recipe.priceTag}
                  onPress={handleRecipePress}
                  recipeId={recipe.id}
                  style={styles.recipeCard}
                />
              ))}
              
              {filteredRecipes.length > 5 && (
                <CustomButton
                  text={`Ver todas (${filteredRecipes.length})`}
                  onPress={handleSearch}
                  variant="outline"
                  style={styles.viewAllButton}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 12,
  },
  searchButton: {
    marginTop: 8,
  },
  quickSearchSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickSearchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSearchChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickSearchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  filterChipSelected: {
    borderWidth: 2,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    fontWeight: '700',
  },
  resultsSection: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsList: {
    gap: 12,
  },
  recipeCard: {
    marginBottom: 8,
  },
  viewAllButton: {
    marginTop: 16,
  },
});