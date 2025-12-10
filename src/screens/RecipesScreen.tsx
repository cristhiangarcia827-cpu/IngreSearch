// RecipesScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import SectionTitle from '../components/SectionTitle';
import RecipeCard from '../components/RecipeCard';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../hooks/useTheme';
import { RECIPES } from '../data/recipes';
import { RootStackParamList } from '../navigation/RootNavigator';
import { loadFavorites, clearFavoriteError } from '../store/slices/uiSlice';
import type { RootState, AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function RecipesScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, themeColor, backgroundColor } = useTheme();
  
  const { ingredients, results } = useSelector((state: RootState) => state.search);
  const mode = useSelector((state: RootState) => state.ui.mode);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  const favorites = useSelector((state: RootState) => state.ui.favorites);
  
  // Estado para el filtro de favoritos
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Cargar favoritos cuando se monta el componente y hay usuario
  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  // Limpiar error de favoritos cuando se desmonta
  useEffect(() => {
    return () => {
      dispatch(clearFavoriteError());
    };
  }, [dispatch]);

  // Mostrar resultados de búsqueda o todas las recetas
  const displayRecipes = useMemo(() => {
    let filteredRecipes = results.length > 0 
      ? RECIPES.filter(recipe => results.includes(recipe.id))
      : RECIPES;

    // Aplicar filtro de favoritos si está activo
    if (showFavoritesOnly && currentUser) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        favorites.includes(recipe.id)
      );
    }

    return filteredRecipes;
  }, [results, showFavoritesOnly, favorites, currentUser]);

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: RECIPES.find(r => r.id === recipeId)?.title
    });
  };

  const toggleFavoritesFilter = () => {
    if (!currentUser) {
      Alert.alert(
        'Inicia sesión',
        'Debes iniciar sesión para ver tus recetas favoritas',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Iniciar sesión', 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }
    
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const clearAllFilters = () => {
    setShowFavoritesOnly(false);
  };

  const isLoggedIn = !!currentUser;
  const hasActiveFilters = showFavoritesOnly;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con título y filtros */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {results.length > 0 ? (
              <>
                <SectionTitle 
                  text="Resultados de Búsqueda" 
                  color={themeColor}
                  align="left"
                />
                {ingredients && (
                  <Text style={[styles.searchInfo, { color: colors.gray }]}>
                    Ingredientes: {ingredients}
                  </Text>
                )}
              </>
            ) : (
              <SectionTitle 
                text="Todas las Recetas" 
                color={themeColor}
                align="left"
              />
            )}
          </View>
          
          {/* Botón de filtro de favoritos */}
          {isLoggedIn && (
            <TouchableOpacity
              style={[
                styles.favoriteFilterButton,
                showFavoritesOnly && styles.favoriteFilterButtonActive,
                { borderColor: themeColor }
              ]}
              onPress={toggleFavoritesFilter}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showFavoritesOnly ? "heart" : "heart-outline"} 
                size={20} 
                color={showFavoritesOnly ? '#fff' : themeColor} 
              />
              <Text style={[
                styles.favoriteFilterText,
                { color: showFavoritesOnly ? '#fff' : themeColor }
              ]}>
                Favoritos
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Indicadores de filtros activos */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersContainer}>
            <Text style={[styles.activeFiltersTitle, { color: colors.textPrimary }]}>
              Filtros activos:
            </Text>
            
            <View style={styles.activeFilters}>
              {showFavoritesOnly && (
                <View style={[
                  styles.activeFilterChip,
                  { backgroundColor: themeColor + '20', borderColor: themeColor }
                ]}>
                  <Ionicons name="heart" size={14} color={themeColor} />
                  <Text style={[styles.activeFilterText, { color: themeColor }]}>
                    Solo favoritos ({favorites.length})
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowFavoritesOnly(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={16} color={themeColor} />
                  </TouchableOpacity>
                </View>
              )}
              
              {hasActiveFilters && (
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={clearAllFilters}
                >
                  <Text style={[styles.clearAllText, { color: themeColor }]}>
                    Limpiar todos
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Información del usuario */}
        {isLoggedIn && (
          <View style={[styles.userInfoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.userInfoRow}>
              <Ionicons name="person-circle" size={20} color={themeColor} />
              <Text style={[styles.userInfoText, { color: colors.textPrimary }]}>
                Hola, {currentUser?.name}
              </Text>
            </View>
            <View style={styles.userInfoRow}>
              <Ionicons name="heart" size={16} color="#FF6B6B" />
              <Text style={[styles.favoriteCount, { color: colors.gray }]}>
                Tienes {favorites.length} receta{favorites.length !== 1 ? 's' : ''} favorita{favorites.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Lista de recetas */}
        <View style={styles.recipesList}>
          {displayRecipes.length > 0 ? (
            <>
              <Text style={[styles.resultsCount, { color: colors.gray }]}>
                Mostrando {displayRecipes.length} receta{displayRecipes.length !== 1 ? 's' : ''}
                {showFavoritesOnly && ' favoritas'}
              </Text>
              
              {displayRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  priceTag={recipe.priceTag}
                  onPress={() => handleRecipePress(recipe.id)}
                  recipeId={recipe.id}
                  style={styles.recipeCard}
                />
              ))}
            </>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons 
                name={showFavoritesOnly ? "heart-dislike" : "restaurant-outline"} 
                size={48} 
                color={colors.gray} 
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                {showFavoritesOnly 
                  ? 'No tienes recetas favoritas'
                  : results.length > 0 
                    ? 'No se encontraron recetas con esos ingredientes'
                    : 'No hay recetas disponibles'}
              </Text>
              
              {showFavoritesOnly && isLoggedIn ? (
                <>
                  <Text style={[styles.emptySubtext, { color: colors.gray }]}>
                    Marca algunas recetas como favoritas para verlas aquí
                  </Text>
                  <CustomButton
                    text="Explorar recetas"
                    onPress={() => setShowFavoritesOnly(false)}
                    variant="outline"
                    style={styles.exploreButton}
                  />
                </>
              ) : results.length > 0 ? (
                <Text style={[styles.emptySubtext, { color: colors.gray }]}>
                  Intenta con otros ingredientes o elimina algunos filtros
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Sugerencia para usuarios no logueados */}
        {!isLoggedIn && (
          <View style={[styles.loginPrompt, { backgroundColor: colors.cardBg + '80', borderColor: colors.border }]}>
            <Text style={[styles.loginPromptText, { color: colors.textPrimary }]}>
              <Ionicons name="information-circle" size={16} color={themeColor} />{' '}
              Inicia sesión para guardar tus recetas favoritas y usar el filtro
            </Text>
            <CustomButton
              text="Iniciar sesión"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              fullWidth={false}
              style={styles.loginButton}
            />
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  searchInfo: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  favoriteFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 8,
  },
  favoriteFilterButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  favoriteFilterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    marginBottom: 16,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  userInfoCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfoText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  favoriteCount: {
    marginLeft: 6,
    fontSize: 13,
  },
  recipesList: {
    gap: 12,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  recipeCard: {
    marginBottom: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  exploreButton: {
    marginTop: 8,
  },
  loginPrompt: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  loginPromptText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 8,
  },
});