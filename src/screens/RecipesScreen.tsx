import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import SectionTitle from '../components/SectionTitle';
import RecipeCard from '../components/RecipeCard';
import CustomButton from '../components/CustomButton';
import FilterChip from '../components/FilterChip';
import EmptyState from '../components/EmptyState';
import UserInfoCard from '../components/UserInfoCard';
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
  
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearFavoriteError());
    };
  }, [dispatch]);

  const displayRecipes = useMemo(() => {
    let filteredRecipes = results.length > 0 
      ? RECIPES.filter(recipe => results.includes(recipe.id))
      : RECIPES;

    if (showFavoritesOnly && currentUser) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        favorites.includes(recipe.id)
      );
    }

    return filteredRecipes;
  }, [results, showFavoritesOnly, favorites, currentUser]);

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: RECIPES.find(r => r.id === recipeId)?.title
    });
  }, [navigation]);

  const toggleFavoritesFilter = useCallback(() => {
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
  }, [currentUser, showFavoritesOnly, navigation]);

  const clearAllFilters = useCallback(() => {
    setShowFavoritesOnly(false);
  }, []);

  const isLoggedIn = !!currentUser;
  const hasActiveFilters = showFavoritesOnly;

  const renderEmptyState = useCallback(() => {
    if (showFavoritesOnly && isLoggedIn) {
      return (
        <EmptyState
          icon="heart-dislike"
          title="No tienes recetas favoritas"
          subtitle="Marca algunas recetas como favoritas para verlas aquí"
          actionButton={
            <CustomButton
              text="Explorar recetas"
              onPress={() => setShowFavoritesOnly(false)}
              variant="outline"
              style={styles.exploreButton}
            />
          }
          style={styles.emptyState}
        />
      );
    }

    if (results.length > 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="No se encontraron recetas con esos ingredientes"
          subtitle="Intenta con otros ingredientes o elimina algunos filtros"
          style={styles.emptyState}
        />
      );
    }

    return (
      <EmptyState
        icon="restaurant-outline"
        title="No hay recetas disponibles"
        style={styles.emptyState}
      />
    );
  }, [showFavoritesOnly, isLoggedIn, results.length]);

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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

        {hasActiveFilters && (
          <View style={styles.activeFiltersContainer}>
            <Text style={[styles.activeFiltersTitle, { color: colors.textPrimary }]}>
              Filtros activos:
            </Text>
            
            <View style={styles.activeFilters}>
              {showFavoritesOnly && (
                <FilterChip
                  label={`Solo favoritos (${favorites.length})`}
                  icon="heart"
                  color={themeColor}
                  onRemove={() => setShowFavoritesOnly(false)}
                />
              )}
              
              <TouchableOpacity 
                style={styles.clearAllButton}
                onPress={clearAllFilters}
              >
                <Text style={[styles.clearAllText, { color: themeColor }]}>
                  Limpiar todos
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoggedIn && currentUser && (
          <UserInfoCard
            name={currentUser.name}
            favoritesCount={favorites.length}
            themeColor={themeColor}
            colors={colors}
            style={styles.userInfoCard}
          />
        )}

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
                  onPress={handleRecipePress}
                  recipeId={recipe.id}
                  style={styles.recipeCard}
                />
              ))}
            </>
          ) : (
            renderEmptyState()
          )}
        </View>

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
    marginBottom: 16,
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
    marginVertical: 20,
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