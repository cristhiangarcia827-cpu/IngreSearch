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
import { useTheme } from '../hooks/useTheme';

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
  const { colors } = useTheme();
  
  const showRequiredError = required && value.trim() === '';
  const displayError = error || (showRequiredError ? 'Este campo es obligatorio' : '');

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle, { color: colors.textPrimary }]}>
            {label}
            {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
          </Text>
          {showCharacterCount && maxLength && (
            <Text style={[styles.characterCount, { color: colors.gray }]}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      ) : null}
      
      <TextInput
        style={[
          styles.input, 
          displayError ? styles.inputError : styles.inputNormal,
          rest.multiline && styles.multilineInput,
          { 
            borderColor: displayError ? colors.error : colors.border,
            backgroundColor: colors.cardBg,
            color: colors.textPrimary,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholderTextColor={colors.gray}
        maxLength={maxLength}
        {...rest}
      />
      
      {displayError ? (
        <Text style={[styles.error, { color: colors.error }]}>{displayError}</Text>
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
  },
  required: { 
    fontWeight: 'bold',
  },
  input: { 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    fontSize: 16,
  },
  inputNormal: { 
    // borderColor manejado inline
  },
  inputError: { 
    // borderColor manejado inline
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: { 
    marginTop: 4, 
    fontSize: 12 
  },
  characterCount: {
    fontSize: 12,
  }
});