import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import SectionTitle from '../components/SectionTitle';
import RecipeCard from '../components/RecipeCard';
import { useTheme } from '../hooks/useTheme';
import { RECIPES } from '../data/recipes';
import { RootStackParamList } from '../navigation/RootNavigator';
import { loadFavorites } from '../store/slices/uiSlice';
import type { RootState, AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function RecipesScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, themeColor, backgroundColor } = useTheme();
  
  const { ingredients, results } = useSelector((state: RootState) => state.search);
  const mode = useSelector((state: RootState) => state.ui.mode);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);

  // Cargar favoritos cuando se monta el componente y hay usuario
  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  // Mostrar resultados de búsqueda o todas las recetas
  const displayRecipes = results.length > 0 
    ? RECIPES.filter(recipe => results.includes(recipe.id))
    : RECIPES;

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: RECIPES.find(r => r.id === recipeId)?.title
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top']}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {results.length > 0 ? (
            <View style={{ flex: 1 }}>
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
            </View>
          ) : (
            <SectionTitle 
              text="Todas las Recetas" 
              color={themeColor}
              align="left"
              style={{ flex: 1 }}
            />
          )}
        </View>

        <View style={styles.recipesList}>
          {displayRecipes.length > 0 ? (
            displayRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                priceTag={recipe.priceTag}
                onPress={() => handleRecipePress(recipe.id)}
                recipeId={recipe.id}
                style={styles.recipeCard}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons 
                name="restaurant-outline" 
                size={48} 
                color={colors.gray} 
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                {results.length > 0 
                  ? 'No se encontraron recetas con esos ingredientes'
                  : 'No hay recetas disponibles'}
              </Text>
              {results.length > 0 && (
                <Text style={[styles.emptySubtext, { color: colors.gray }]}>
                  Intenta con otros ingredientes o elimina algunos filtros
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  searchInfo: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  recipesList: {
    gap: 12,
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
  },
});