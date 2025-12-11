import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  name: string;
  favoritesCount: number;
  themeColor: string;
  colors: any;
  style?: any;
};

const UserInfoCard = memo(({ 
  name, 
  favoritesCount, 
  themeColor, 
  colors,
  style 
}: Props) => {
  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }, style]}>
      <View style={styles.row}>
        <Ionicons name="person-circle" size={20} color={themeColor} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>Hola, {name}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="heart" size={16} color="#FF6B6B" />
        <Text style={[styles.count, { color: colors.gray }]}>
          {favoritesCount} receta{favoritesCount !== 1 ? 's' : ''} favorita{favoritesCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  count: {
    marginLeft: 6,
    fontSize: 13,
  },
});

export default UserInfoCard;