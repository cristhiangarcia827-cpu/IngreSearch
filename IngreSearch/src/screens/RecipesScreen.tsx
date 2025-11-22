
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RecipesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de recetas (nose si poner esto a futuro)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16 }
});