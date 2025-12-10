import React, { useState, useMemo, useEffect } from 'react';
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
import { RootStackParamList } from '../navigation/RootNavigator';
import { TabsParamList } from '../navigation/TabsNavigator';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import RecipeCard from '../components/RecipeCard';
import { colors } from '../theme/colors';
import { RECIPES } from '../data/recipes';
import { setIngredients, setResults } from '../store/slices/searchSlice';
import { loadFavorites } from '../store/slices/uiSlice';
import type { RootState, AppDispatch } from '../store';
import type { Recipe } from '../data/recipes';

// Crear un tipo compuesto que combine ambos navigators
type SearchScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'Tabs'>,
  BottomTabNavigationProp<TabsParamList>
>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const searchState = useSelector((state: RootState) => state.search);
  const mode = useSelector((state: RootState) => state.ui.mode);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);

  // Estado local para búsqueda
  const [searchQuery, setSearchQuery] = useState(searchState.ingredients);
  const [selectedPrice, setSelectedPrice] = useState<('bajo' | 'medio' | 'alto')[]>([]);

  const themeColor = mode === 'ahorro' ? colors.savingsPrimary : colors.primary;
  const backgroundColor = mode === 'ahorro' ? colors.savingsBg : colors.bg;

  // Opciones de precio
  const priceOptions: ('bajo' | 'medio' | 'alto')[] = ['bajo', 'medio', 'alto'];

  // Cargar favoritos cuando se monta el componente y hay usuario
  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  // Filtrar recetas
  const filteredRecipes = useMemo(() => {
    return RECIPES.filter(recipe => {
      // Filtro por texto de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          recipe.title.toLowerCase().includes(query) ||
          recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Filtro por precio
      if (selectedPrice.length > 0 && !selectedPrice.includes(recipe.priceTag)) {
        return false;
      }

      // Filtro por modo ahorro
      if (mode === 'ahorro' && recipe.priceTag !== 'bajo') {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedPrice, mode]);

  // Manejar selección de filtros de precio
  const togglePriceFilter = (price: 'bajo' | 'medio' | 'alto') => {
    setSelectedPrice(prev => 
      prev.includes(price) 
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  };

  const handleSearch = () => {
    if (!searchQuery.trim() && selectedPrice.length === 0) {
      Alert.alert(
        'Búsqueda vacía',
        'Ingresa algún ingrediente o selecciona un filtro para buscar.'
      );
      return;
    }

    dispatch(setIngredients(searchQuery));
    dispatch(setResults(filteredRecipes.map(r => r.id)));
    
    // Navegar al tab de Recetas usando el tipo compuesto
    navigation.navigate('Tabs', { screen: 'Recetas' } as any);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPrice([]);
    dispatch(setIngredients(''));
    dispatch(setResults([]));
  };

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: RECIPES.find(r => r.id === recipeId)?.title
    });
  };

  const handleQuickSearch = (ingredient: string) => {
    setSearchQuery(prev => {
      const current = prev.trim();
      if (current === '') return ingredient;
      return `${current}, ${ingredient}`;
    });
  };

  // Ingredientes comunes para búsqueda rápida
  const commonIngredients = ['arroz', 'huevo', 'tomate', 'pasta', 'ajo', 'lechuga', 'pollo'];

  const hasActiveFilters = searchQuery.trim() !== '' || selectedPrice.length > 0;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <SectionTitle 
        text="Buscar Recetas" 
        color={themeColor}
        align="left"
      />

      {/* Barra de búsqueda */}
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

      {/* Ingredientes rápidos */}
      <View style={styles.quickSearchSection}>
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

      {/* Filtros de precio */}
      <View style={styles.filterSection}>
        <Text style={[styles.sectionTitle, { color: themeColor }]}>
          Filtro por Precio
        </Text>
        <View style={styles.filterOptions}>
          {priceOptions.map(price => {
            const isSelected = selectedPrice.includes(price);
            let priceColor = '';
            
            switch(price) {
              case 'bajo': priceColor = colors.savingsPrimary; break;
              case 'medio': priceColor = colors.primary; break;
              case 'alto': priceColor = '#8A2BE2'; break;
            }
            
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

      {/* Resultados en tiempo real */}
      <View style={styles.resultsSection}>
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

        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: themeColor }]}>
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
                onPress={() => handleRecipePress(recipe.id)}
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
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
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