import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';

type ButtonVariant = 'primary' | 'savings' | 'outline' | 'text';

type Props = {
  text: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
};

export default function CustomButton({ 
  text, 
  onPress, 
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = true
}: Props) {

  const getVariantColor = (): string => {
    switch (variant) {
      case 'savings':
        return colors.savingsPrimary;
      case 'primary':
      case 'outline':
      case 'text':
      default:
        return colors.primary;
    }
  };

  const getBackgroundColor = (): string => {
    if (disabled) return colors.disabled;
    if (variant === 'outline' || variant === 'text') return 'transparent';
    return getVariantColor();
  };

  const getTextColor = (): string => {
    if (disabled) return '#999';
    if (variant === 'outline' || variant === 'text') return getVariantColor();
    return '#fff';
  };

  const getBorderColor = (): string => {
    if (disabled) return colors.disabled;
    if (variant === 'outline') return getVariantColor();
    return 'transparent';
  };

  const getBorderWidth = (): number => {
    return variant === 'outline' ? 1 : 0;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.btn, 
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: getBorderWidth(),
          width: fullWidth ? '100%' : 'auto',
        },
        disabled && styles.disabled,
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
        />
      ) : (
        <Text style={[
          styles.text, 
          { color: getTextColor() },
          variant === 'text' && styles.textVariant,
          textStyle
        ]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginVertical: 8,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.6,
  },
  text: { 
    fontWeight: '600',
    fontSize: 16,
  },
  textVariant: {
    textDecorationLine: 'underline',
  }
});