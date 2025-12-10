import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RECIPES } from '../data/recipes';
import SectionTitle from '../components/SectionTitle';
import FavoriteButton from '../components/FavoriteButton';
import { loadFavorites } from '../store/slices/uiSlice';
import { RootStackParamList } from '../navigation/RootNavigator';
import type { RootState, AppDispatch } from '../store';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen() {
  const route = useRoute<RecipeDetailRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = route.params;
  const recipe = RECIPES.find(r => r.id === id);
  
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);

  // Cargar favoritos cuando se monta el componente y hay usuario
  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la receta</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header con título y botón de favoritos */}
      <View style={styles.header}>
        <SectionTitle text={recipe.title} color="#ff7a00" align="left" />
        <View style={styles.favoriteContainer}>
          <FavoriteButton recipeId={recipe.id} size={28} />
        </View>
      </View>
      
      <Text style={styles.meta}>Costo: {recipe.priceTag}</Text>
      
      <Text style={styles.subtitle}>Ingredientes:</Text>
      {recipe.ingredients.map(i => (
        <Text key={i} style={styles.item}>• {i}</Text>
      ))}
      
      <Text style={styles.subtitle}>Pasos:</Text>
      {recipe.steps.map((s, idx) => (
        <Text key={idx} style={styles.item}>{idx + 1}. {s}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'flex-start' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  favoriteContainer: {
    marginLeft: 16,
  },
  meta: { 
    marginBottom: 8,
    fontSize: 16,
    color: '#666',
  },
  subtitle: { 
    marginTop: 12, 
    fontWeight: '600',
    fontSize: 18,
    color: '#333',
  },
  item: { 
    marginVertical: 4,
    fontSize: 16,
    lineHeight: 24,
  }
});