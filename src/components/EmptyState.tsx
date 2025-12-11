import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type Props = {
  icon?: string;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  iconSize?: number;
  style?: any;
};

const EmptyState = memo(({ 
  icon = "alert-circle-outline", 
  title, 
  subtitle, 
  actionButton,
  iconSize = 48,
  style 
}: Props) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }, style]}>
      <Ionicons name={icon as any} size={iconSize} color={colors.gray} style={styles.icon} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.gray }]}>{subtitle}</Text>
      )}
      {actionButton && <View style={styles.buttonContainer}>{actionButton}</View>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
});

export default EmptyState;