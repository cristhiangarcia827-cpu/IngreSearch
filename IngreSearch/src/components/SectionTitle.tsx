
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function SectionTitle({ text, color = '#333' }: { text: string; color?: string }) {
  return <Text style={[styles.title, { color }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' }
});