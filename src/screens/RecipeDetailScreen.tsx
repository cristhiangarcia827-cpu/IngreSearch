
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RECIPES } from '../data/recipes';
import SectionTitle from '../components/SectionTitle';

export default function RecipeDetailScreen() {
  const route = useRoute<any>();
  const id: string = route.params?.id;
  const recipe = RECIPES.find(r => r.id === id);

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la receta</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionTitle text={recipe.title} color="#ff7a00" />
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
  meta: { marginBottom: 8 },
  subtitle: { marginTop: 12, fontWeight: '600' },
  item: { marginVertical: 4 }
});