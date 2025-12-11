import React, { useMemo, useEffect, useCallback } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  Image,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import RecipeCard from '../components/RecipeCard';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../hooks/useTheme';
import { RECIPES } from '../data/recipes';
import { RootStackParamList } from '../navigation/RootNavigator';
import { setIngredients, setResults } from '../store/slices/searchSlice';
import { loadFavorites } from '../store/slices/uiSlice';
import type { RootState, AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, themeColor, backgroundColor } = useTheme();

  const ingredients = useSelector((state: RootState) => state.search.ingredients);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  const mode = useSelector((state: RootState) => state.ui.mode);

  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const filtered = RECIPES.filter(recipe => {
      const query = searchQuery.toLowerCase();
      return (
        recipe.title.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
      );
    });

    dispatch(setIngredients(searchQuery));
    dispatch(setResults(filtered.map(r => r.id)));
    navigation.navigate('Tabs', { screen: 'Recetas' } as any);
  }, [searchQuery, dispatch, navigation]);

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: RECIPES.find(recipe => recipe.id === recipeId)?.title
    });
  }, [navigation]);

  const featuredRecipes = useMemo(() => RECIPES.slice(0, 3), []);

  return (
    <View style={{ flex: 1, backgroundColor }}>
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
        
        <Image 
          source={require('../assets/images/dish.png')} 
          style={styles.image} 
          resizeMode="contain"
        />

        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <SectionTitle
              text="Recetas Destacadas"
              color={themeColor}
              size="small"
              align="left"
            />
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Tabs', { screen: 'Recetas' } as any)}
            >
              <Text style={[styles.viewAllText, { color: themeColor }]}>
                Ver todas
              </Text>
              <Ionicons name="chevron-forward" size={16} color={themeColor} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.recipesList}>
            {featuredRecipes.length > 0 ? (
              featuredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  priceTag={recipe.priceTag}
                  onPress={handleRecipePress}
                  recipeId={recipe.id}
                  style={styles.recipeCard}
                />
              ))
            ) : (
              <EmptyState
                icon="restaurant-outline"
                title="No hay recetas destacadas disponibles"
                style={styles.emptyState}
              />
            )}
          </View>
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
  image: { 
    width: 150, 
    height: 150, 
    alignSelf: 'center', 
    marginVertical: 16 
  },
  searchSection: {
    marginBottom: 24,
  },
  searchInput: {
    marginBottom: 12,
  },
  searchButton: {
    marginTop: 8,
  },
  featuredSection: {
    marginTop: 16,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  recipesList: {
    gap: 12,
  },
  recipeCard: {
    marginBottom: 8,
  },
  emptyState: {
    marginVertical: 20,
  },
});