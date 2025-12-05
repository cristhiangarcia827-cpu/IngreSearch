import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  Text
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SectionTitle from '../components/SectionTitle';
import RecipeCard from '../components/RecipeCard';
import { colors } from '../theme/colors';
import { RECIPES } from '../data/recipes';
import { RootStackParamList } from '../navigation/RootNavigator';
import type { RootState } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function RecipesScreen() {
  const navigation = useNavigation<NavProp>();
  const { ingredients, results } = useSelector((state: RootState) => state.search);
  const mode = useSelector((state: RootState) => state.ui.mode);

  const themeColor = mode === 'ahorro' ? colors.savingsPrimary : colors.primary;
  
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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {results.length > 0 ? (
        <>
          <SectionTitle 
            text="Resultados de Búsqueda" 
            color={themeColor}
            align="left"
          />
          {ingredients && (
            <Text style={styles.searchInfo}>
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

      <View style={styles.recipesList}>
        {displayRecipes.length > 0 ? (
          displayRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              priceTag={recipe.priceTag}
              onPress={() => handleRecipePress(recipe.id)}
              style={styles.recipeCard}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {results.length > 0 
                ? 'No se encontraron recetas con esos ingredientes'
                : 'No hay recetas disponibles'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  searchInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});