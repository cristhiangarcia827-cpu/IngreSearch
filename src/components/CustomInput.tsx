import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { colors } from '../theme/colors';

type Props = TextInputProps & {
  label?: string;
  required?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  showCharacterCount?: boolean;
  maxLength?: number;
};

export default function CustomInput({ 
  label, 
  required, 
  value, 
  onChangeText, 
  onBlur,
  error,
  containerStyle,
  labelStyle,
  showCharacterCount = false,
  maxLength,
  ...rest 
}: Props) {
  const showRequiredError = required && value.trim() === '';
  const displayError = error || (showRequiredError ? 'Este campo es obligatorio' : '');

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {showCharacterCount && maxLength && (
            <Text style={styles.characterCount}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      ) : null}
      
      <TextInput
        style={[
          styles.input, 
          displayError ? styles.inputError : styles.inputNormal,
          rest.multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholderTextColor="#999"
        maxLength={maxLength}
        {...rest}
      />
      
      {displayError ? (
        <Text style={styles.error}>{displayError}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    marginBottom: 16 
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { 
    fontWeight: '500',
    fontSize: 14,
    color: colors.textPrimary || '#333',
  },
  required: { 
    color: colors.error 
  },
  input: { 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputNormal: { 
    borderColor: '#ddd',
  },
  inputError: { 
    borderColor: colors.error 
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: { 
    color: colors.error, 
    marginTop: 4, 
    fontSize: 12 
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
  }
});