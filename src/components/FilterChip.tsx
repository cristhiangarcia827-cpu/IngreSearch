import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label: string;
  icon?: string;
  onRemove?: () => void;
  color?: string;
  showRemove?: boolean;
  style?: any;
};

const FilterChip = memo(({ 
  label, 
  icon, 
  onRemove, 
  color = '#FF7A00', 
  showRemove = true,
  style 
}: Props) => {
  return (
    <View style={[styles.chip, { backgroundColor: color + '20', borderColor: color }, style]}>
      {icon && <Ionicons name={icon as any} size={14} color={color} style={styles.icon} />}
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
      {showRemove && onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={10} style={styles.removeButton}>
          <Ionicons name="close-circle" size={16} color={color} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 200,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  removeButton: {
    marginLeft: 6,
  },
});

export default FilterChip;