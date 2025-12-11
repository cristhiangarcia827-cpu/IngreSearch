import React, { memo, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ViewStyle 
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import FavoriteButton from './FavoriteButton';

type Props = {
  title: string;
  priceTag: 'bajo' | 'medio' | 'alto';
  onPress: (recipeId: string) => void;
  recipeId: string;
  style?: ViewStyle;
};

const RecipeCard = memo(function RecipeCard({ 
  title, 
  priceTag, 
  onPress, 
  recipeId,
  style 
}: Props) {
  const { colors } = useTheme();
  
  const tagColor = useMemo(() => 
    priceTag === 'bajo' ? colors.savingsPrimary : 
    priceTag === 'medio' ? colors.primary : '#8A2BE2',
    [priceTag, colors.savingsPrimary, colors.primary]
  );

  const handlePress = useCallback(() => {
    onPress(recipeId);
  }, [onPress, recipeId]);

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        style, 
        { 
          backgroundColor: colors.cardBg, 
          borderColor: colors.border 
        }
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.tag, { backgroundColor: tagColor }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.subtitle, { color: colors.gray }]}>
            Costo: {priceTag}
          </Text>
          <FavoriteButton recipeId={recipeId} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    padding: 12, 
    borderWidth: 1, 
    borderRadius: 8, 
    marginBottom: 8, 
    alignItems: 'center',
  },
  tag: { 
    width: 10, 
    height: 40, 
    borderRadius: 4, 
    marginRight: 12 
  },
  content: { 
    flex: 1 
  },
  title: { 
    fontWeight: '600', 
    fontSize: 16, 
    marginBottom: 8 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: { 
    fontSize: 14 
  },
});

export default RecipeCard;