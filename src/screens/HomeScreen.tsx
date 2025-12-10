import React, { useMemo, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  Image,
  ScrollView 
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootStackParamList } from '../navigation/RootNavigator';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SectionTitle from '../components/SectionTitle';
import RecipeCard from '../components/RecipeCard';
import { useTheme } from '../hooks/useTheme';
import { filterRecipes } from '../utils/filterRecipes';
import { RECIPES } from '../data/recipes';
import { setIngredients, setResults } from '../store/slices/searchSlice';
import { loadFavorites } from '../store/slices/uiSlice';
import type { RootState, AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, themeColor, backgroundColor } = useTheme();

  // Redux state
  const ingredients = useSelector((state: RootState) => state.search.ingredients);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  const mode = useSelector((state: RootState) => state.ui.mode);

  // Cargar favoritos cuando se monta el componente y hay usuario
  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  const handleSearch = () => {
    const list = filterRecipes(RECIPES, ingredients, mode);
    dispatch(setResults(list.map(r => r.id)));
    (navigation as any).navigate('Tabs', { screen: 'Recetas' } as any);
  };

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: RECIPES.find(recipe => recipe.id === recipeId)?.title
    });
  };

  // Mostrar algunas recetas destacadas
  const featuredRecipes = RECIPES.slice(0, 3);

  return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle
          text={
            currentUser 
              ? `¡Hola ${currentUser.name}! Busca recetas por ingredientes`
              : 'Busca recetas por ingredientes'
          }
          color={themeColor}
          align="left"
        />
        
        <Image source={require('../assets/images/dish.png')} style={styles.image} />

        <View style={styles.featuredSection}>
          <SectionTitle
            text="Recetas Destacadas"
            color={themeColor}
            size="small"
            align="left"
          />
          
          <View style={styles.recipesList}>
            {featuredRecipes.length > 0 ? (
              featuredRecipes.map(recipe => (
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
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                  No hay recetas destacadas disponibles
                </Text>
              </View>
            )}
          </View>
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
  image: { 
    width: 120, 
    height: 120, 
    alignSelf: 'center', 
    marginBottom: 16 
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 24,
  },
  featuredSection: {
    marginTop: 16,
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
  },
});