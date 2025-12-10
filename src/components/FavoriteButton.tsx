import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addFavoriteToDB, removeFavoriteFromDB } from '../store/slices/uiSlice';
import type { RootState, AppDispatch } from '../store';

type Props = {
  recipeId: string;
  size?: number;
  style?: any;
};

export default function FavoriteButton({ recipeId, size = 24, style }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  const favorites = useSelector((state: RootState) => state.ui.favorites);
  const favoriteError = useSelector((state: RootState) => state.ui.favoriteError);
  const [loading, setLoading] = useState(false);
  
  const isFavorite = favorites.includes(recipeId);
  const isLoggedIn = !!currentUser;

  const handleToggleFavorite = async () => {
    if (!isLoggedIn || !currentUser) {
      Alert.alert(
        'Inicia sesión', 
        'Debes iniciar sesión para guardar recetas favoritas'
      );
      return;
    }

    if (loading) return;

    setLoading(true);
    
    try {
      if (isFavorite) {
        // Remover de favoritos
        await dispatch(removeFavoriteFromDB({
          userId: currentUser.id,
          recipeId
        })).unwrap();
      } else {
        // Agregar a favoritos
        await dispatch(addFavoriteToDB({
          userId: currentUser.id,
          recipeId
        })).unwrap();
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      Alert.alert(
        'Error', 
        'No se pudo actualizar tus favoritos. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Mostrar alerta si hay error
  React.useEffect(() => {
    if (favoriteError) {
      Alert.alert('Error en favoritos', favoriteError);
    }
  }, [favoriteError]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        style,
        loading && styles.loading
      ]}
      onPress={handleToggleFavorite}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size={size * 0.8} 
          color={isFavorite ? "#FF6B6B" : "#666"} 
        />
      ) : (
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={size} 
          color={isFavorite ? "#FF6B6B" : "#666"} 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  loading: {
    opacity: 0.7,
  },
});