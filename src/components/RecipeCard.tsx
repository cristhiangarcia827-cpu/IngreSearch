import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ViewStyle 
} from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  priceTag: 'bajo' | 'medio' | 'alto';
  onPress: () => void;
  style?: ViewStyle;
};

export default function RecipeCard({ title, priceTag, onPress, style }: Props) {
  const tagColor = priceTag === 'bajo' ? colors.savingsPrimary : 
                   priceTag === 'medio' ? colors.primary : '#8A2BE2';

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <View style={[styles.tag, { backgroundColor: tagColor }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Costo: {priceTag}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#eee', 
    borderRadius: 8, 
    marginBottom: 8, 
    alignItems: 'center',
    backgroundColor: '#ffffff'
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
    marginBottom: 4 
  },
  subtitle: { 
    color: '#666',
    fontSize: 14 
  }
});