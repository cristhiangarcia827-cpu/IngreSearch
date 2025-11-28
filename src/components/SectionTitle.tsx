import React from 'react';
import { 
  Text, 
  StyleSheet, 
  TextStyle,
  View 
} from 'react-native';

type Props = {
  text: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large';
  withDivider?: boolean;
  style?: TextStyle;
};

export default function SectionTitle({ 
  text, 
  color = '#333',
  align = 'center',
  size = 'medium',
  withDivider = false,
  style 
}: Props) {
  const getFontSize = (): number => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getFontWeight = (): TextStyle['fontWeight'] => {
    switch (size) {
      case 'small': return '600';
      case 'large': return '800';
      default: return '700';
    }
  };

  // Crear el estilo de texto de manera separada para evitar el error de tipos
  const textStyles = {
    color,
    fontSize: getFontSize(),
    fontWeight: getFontWeight(),
    textAlign: align,
  };

  return (
    <View style={styles.container}>
      <Text 
        style={[
          styles.title,
          textStyles,
          style
        ]}
      >
        {text}
      </Text>
      {withDivider && (
        <View 
          style={[
            styles.divider,
            { backgroundColor: color }
          ]} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: { 
    marginBottom: 8,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginHorizontal: '10%',
    opacity: 0.3,
  }
});