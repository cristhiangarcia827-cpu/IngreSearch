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
import { loadFavorites, clearFavoriteError, setMode } from '../store/slices/uiSlice';
import { clearFilteredRecipes, resetAllFilters } from '../store/slices/recipesSlice';
import {
  selectRecipesScreenData,
  selectIsSavingsMode
} from '../store/selectors';
import type { AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function RecipesScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, themeColor, backgroundColor } = useTheme();
  
  const {
    ingredients,
    results,
    mode,
    currentUser,
    isLoggedIn,
    favorites,
    favoriteCount
  } = useSelector(selectRecipesScreenData);
  
  const isSavingsMode = useSelector(selectIsSavingsMode);
  
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showSavingsOnly, setShowSavingsOnly] = useState(isSavingsMode);

  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearFavoriteError());
      dispatch(clearFilteredRecipes());
    };
  }, [dispatch]);

  useEffect(() => {
    setShowSavingsOnly(isSavingsMode);
  }, [isSavingsMode]);

  const displayRecipes = useMemo(() => {
    let filteredRecipes = results.length > 0 
      ? RECIPES.filter(recipe => results.includes(recipe.id))
      : RECIPES;

    if (showFavoritesOnly && isLoggedIn) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        favorites.includes(recipe.id)
      );
    }

    if (showSavingsOnly) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.priceTag === 'bajo'
      );
    }

    return filteredRecipes;
  }, [results, showFavoritesOnly, showSavingsOnly, favorites, isLoggedIn]);

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: RECIPES.find(r => r.id === recipeId)?.title
    });
  }, [navigation]);

  const toggleFavoritesFilter = useCallback(() => {
    if (!isLoggedIn) {
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
  }, [isLoggedIn, showFavoritesOnly, navigation]);

  const toggleSavingsFilter = useCallback(() => {
    const newSavingsMode = !showSavingsOnly;
    setShowSavingsOnly(newSavingsMode);
    
    if (newSavingsMode) {
      dispatch(setMode('ahorro'));
    } else {
      dispatch(setMode('normal'));
    }
  }, [showSavingsOnly, dispatch]);

  const clearAllFilters = useCallback(() => {
    setShowFavoritesOnly(false);
    setShowSavingsOnly(false);
    dispatch(setMode('normal'));
    dispatch(resetAllFilters());
  }, [dispatch]);

  const hasActiveFilters = showFavoritesOnly || showSavingsOnly;

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

    if (showSavingsOnly) {
      return (
        <EmptyState
          icon="wallet-outline"
          title="No hay recetas económicas disponibles"
          subtitle="Pronto agregaremos más recetas económicas"
          actionButton={
            <CustomButton
              text="Ver todas las recetas"
              onPress={() => {
                setShowSavingsOnly(false);
                dispatch(setMode('normal'));
              }}
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
  }, [showFavoritesOnly, showSavingsOnly, isLoggedIn, results.length, dispatch]);

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
        </View>
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showSavingsOnly && styles.filterButtonActive,
              { 
                borderColor: colors.savingsPrimary,
                backgroundColor: showSavingsOnly ? colors.savingsPrimary : 'transparent'
              }
            ]}
            onPress={toggleSavingsFilter}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showSavingsOnly ? "wallet" : "wallet-outline"} 
              size={20} 
              color={showSavingsOnly ? '#fff' : colors.savingsPrimary} 
            />
            <Text style={[
              styles.filterButtonText,
              { color: showSavingsOnly ? '#fff' : colors.savingsPrimary }
            ]}>
              Modo Ahorro
            </Text>
          </TouchableOpacity>

          {isLoggedIn && (
            <TouchableOpacity
              style={[
                styles.filterButton,
                showFavoritesOnly && styles.filterButtonActive,
                { 
                  borderColor: '#FF6B6B',
                  backgroundColor: showFavoritesOnly ? '#FF6B6B' : 'transparent'
                }
              ]}
              onPress={toggleFavoritesFilter}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showFavoritesOnly ? "heart" : "heart-outline"} 
                size={20} 
                color={showFavoritesOnly ? '#fff' : '#FF6B6B'} 
              />
              <Text style={[
                styles.filterButtonText,
                { color: showFavoritesOnly ? '#fff' : '#FF6B6B' }
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
              {showSavingsOnly && (
                <FilterChip
                  label="Modo ahorro activado"
                  icon="wallet"
                  color={colors.savingsPrimary}
                  onRemove={() => {
                    setShowSavingsOnly(false);
                    dispatch(setMode('normal'));
                  }}
                />
              )}
              
              {showFavoritesOnly && (
                <FilterChip
                  label={`Solo favoritos (${favoriteCount})`}
                  icon="heart"
                  color="#FF6B6B"
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

        {showSavingsOnly && (
          <View style={[styles.savingsInfo, { backgroundColor: colors.savingsBg + '80', borderColor: colors.savingsPrimary }]}>
            <Ionicons name="information-circle" size={20} color={colors.savingsPrimary} />
            <Text style={[styles.savingsInfoText, { color: colors.textPrimary }]}>
              <Text style={{ fontWeight: 'bold', color: colors.savingsPrimary }}>Modo ahorro:</Text> Mostrando solo recetas económicas (precio bajo)
            </Text>
          </View>
        )}

        {isLoggedIn && currentUser && (
          <UserInfoCard
            name={currentUser.name}
            favoritesCount={favoriteCount}
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
                {showSavingsOnly && ' económicas'}
                {showFavoritesOnly && showSavingsOnly && ' favoritas y económicas'}
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

        <View style={[styles.priceInfo, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.priceInfoTitle, { color: themeColor }]}>
            Clasificación por precio:
          </Text>
          <View style={styles.priceCategories}>
            <View style={styles.priceCategory}>
              <View style={[styles.priceDot, { backgroundColor: colors.savingsPrimary }]} />
              <Text style={[styles.priceLabel, { color: colors.textPrimary }]}>
                Bajo: Recetas económicas
              </Text>
            </View>
            <View style={styles.priceCategory}>
              <View style={[styles.priceDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.priceLabel, { color: colors.textPrimary }]}>
                Medio: Precio regular
              </Text>
            </View>
            <View style={styles.priceCategory}>
              <View style={[styles.priceDot, { backgroundColor: '#8A2BE2' }]} />
              <Text style={[styles.priceLabel, { color: colors.textPrimary }]}>
                Alto: Ingredientes especiales
              </Text>
            </View>
          </View>
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
  filterButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
    justifyContent: 'center',
    gap: 8,
  },
  filterButtonActive: {
    borderWidth: 2,
  },
  filterButtonText: {
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
  savingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  savingsInfoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  userInfoCard: {
    marginBottom: 16,
  },
  recipesList: {
    gap: 12,
    marginBottom: 24,
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
  priceInfo: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  priceInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceCategories: {
    gap: 8,
  },
  priceCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priceLabel: {
    fontSize: 14,
  },
  loginPrompt: {
    marginTop: 16,
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