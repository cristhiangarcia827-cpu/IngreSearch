
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  text: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: 'primary' | 'savings';
};

export default function CustomButton({ text, onPress, variant = 'primary' }: Props) {
  const bg = variant === 'savings' ? colors.savingsPrimary : colors.primary;
  return (
    <TouchableOpacity style={[styles.btn, { backgroundColor: bg }]} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  text: { color: '#fff', fontWeight: '600' }
});