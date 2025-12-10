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
import { useTheme } from '../hooks/useTheme'; // Añadir import
import { loadFavorites } from '../store/slices/uiSlice';
import { RootStackParamList } from '../navigation/RootNavigator';
import type { RootState, AppDispatch } from '../store';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen() {
  const route = useRoute<RecipeDetailRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = route.params;
  const recipe = RECIPES.find(r => r.id === id);
  const { colors, themeColor, backgroundColor } = useTheme(); // Usar hook
  
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);

  // Cargar favoritos cuando se monta el componente y hay usuario
  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  if (!recipe) {
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <Text style={{ color: colors.textPrimary }}>No se encontró la receta</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <SectionTitle 
          text={recipe.title} 
          color={themeColor}
          align="left"
          style={{ flex: 1 }}
        />
        <View style={styles.headerButtons}>
          <FavoriteButton recipeId={recipe.id} size={28} style={styles.favoriteButton} />
        </View>
      </View>
      
      {/* Información de la receta */}
      <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <Ionicons name="pricetag" size={20} color={colors.primary} />
          <Text style={[styles.meta, { color: colors.textPrimary, marginLeft: 8 }]}>
            Costo: <Text style={{ fontWeight: 'bold', color: themeColor }}>{recipe.priceTag}</Text>
          </Text>
        </View>
      </View>
      
      {/* Ingredientes */}
      <View style={styles.section}>
        <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
          <Ionicons name="cart" size={20} color={themeColor} /> Ingredientes:
        </Text>
        <View style={styles.ingredientsList}>
          {recipe.ingredients.map((ingredient, index) => (
            <View 
              key={index} 
              style={[
                styles.ingredientItem, 
                { backgroundColor: colors.lightGray }
              ]}
            >
              <Text style={[styles.item, { color: colors.textPrimary }]}>
                • {ingredient}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Pasos */}
      <View style={styles.section}>
        <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
          <Ionicons name="list" size={20} color={themeColor} /> Pasos:
        </Text>
        <View style={styles.stepsList}>
          {recipe.steps.map((step, idx) => (
            <View 
              key={idx} 
              style={[
                styles.stepItem, 
                { backgroundColor: colors.cardBg, borderColor: colors.border }
              ]}
            >
              <View style={[styles.stepNumber, { backgroundColor: themeColor }]}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textPrimary }]}>
                {step}
              </Text>
            </View>
          ))}
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
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    marginRight: 0,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  meta: { 
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  subtitle: { 
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    padding: 12,
    borderRadius: 8,
  },
  item: { 
    fontSize: 16,
    lineHeight: 24,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});