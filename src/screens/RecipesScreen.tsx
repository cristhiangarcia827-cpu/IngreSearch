import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function RecipesScreen() {
  const { ingredients, results } = useSelector((state: RootState) => state.search);
  const mode = useSelector((state: RootState) => state.ui.mode);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'ahorro' ? 'Recetas económicas' : 'Recetas encontradas'}
      </Text>
      <Text style={styles.subtitle}>Ingredientes buscados: {ingredients || 'Ninguno'}</Text>

      {results.length === 0 ? (
        <Text style={styles.text}>No hay resultados todavía</Text>
      ) : (
        results.map((id, index) => (
          <Text key={index} style={styles.text}>
            {mode === 'ahorro' ? `Receta económica #${id}` : `Receta #${id}`}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 12 },
  text: { fontSize: 14, marginVertical: 4 },
});