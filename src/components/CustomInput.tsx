
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';

type Props = TextInputProps & {
  label?: string;
  required?: boolean;
  value: string;
  onChangeText: (t: string) => void;
};

export default function CustomInput({ label, required, value, onChangeText, ...rest }: Props) {
  const showError = required && value.trim() === '';

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      ) : null}
      <TextInput
        style={[styles.input, showError && { borderColor: colors.error }]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        {...rest}
      />
      {showError ? <Text style={styles.error}>Este campo es obligatorio</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  error: { color: colors.error, marginTop: 4, fontSize: 12 }
});