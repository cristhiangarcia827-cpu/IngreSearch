import React from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import SectionTitle from '../components/SectionTitle';
import CustomButton from '../components/CustomButton';
import { colors } from '../theme/colors';
import { logoutUser } from '../store/slices/uiSlice';
import { RECIPES } from '../data/recipes';
import type { RootState, AppDispatch } from '../store';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener usuario actual de Redux
  const mode = useSelector((state: RootState) => state.ui.mode);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  const favorites = useSelector((state: RootState) => state.ui.favorites);

  const themeColor = mode === 'ahorro' ? colors.savingsPrimary : colors.primary;
  const backgroundColor = mode === 'ahorro' ? colors.savingsBg : colors.bg;
  const isLoggedIn = !!currentUser;

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
            Alert.alert(
              'Sesión cerrada', 
              'Has cerrado sesión correctamente.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Información del usuario */}
      <View style={styles.userInfoSection}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: themeColor }]}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
        
        <SectionTitle 
          text={currentUser ? `Hola, ${currentUser.name}` : "Mi Perfil"} 
          color={themeColor}
          align="center"
        />
        
        {currentUser && (
          <Text style={[styles.userEmail, { color: themeColor }]}>
            {currentUser.email}
          </Text>
        )}
        
        {!currentUser && (
          <Text style={styles.welcomeText}>
            Inicia sesión para guardar tus recetas favoritas y personalizar tu perfil.
          </Text>
        )}
      </View>
            {/* Estadísticas (solo para usuarios logueados) */}
      {isLoggedIn && (
        <View style={styles.statsSection}>
          <SectionTitle 
            text="Mis Estadísticas" 
            color={themeColor}
            align="left"
          />
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Recetas probadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favoritas</Text>
            </View>
          </View>
        </View>
      )}

      {/* Acciones de cuenta */}
      <View style={styles.actionsSection}>
        <SectionTitle 
          text="Cuenta" 
          color={themeColor}
          align="left"
        />
        
        {isLoggedIn ? (
          <>
            <CustomButton
              text="Editar Perfil"
              onPress={handleEditProfile}
              variant="outline"
              style={styles.actionButton}
            />
            
            <CustomButton
              text="Cerrar Sesión"
              onPress={handleLogout}
              variant="outline"
              style={styles.actionButton}
            />
            
            <Text style={styles.sessionInfo}>
              Sesión iniciada como: {currentUser?.email}
              {'\n'}
              Tu sesión se mantendrá incluso si cierras la aplicación.
            </Text>
          </>
        ) : (
          <>
            <CustomButton
              text="Iniciar Sesión"
              onPress={handleLogin}
              variant="outline"
              style={styles.actionButton}
            />

            <CustomButton
              text="Crear Cuenta"
              onPress={handleRegister}
              variant="savings"
              style={styles.actionButton}
            />
            
            <Text style={styles.loginPrompt}>
              Inicia sesión para acceder a todas las funciones de la aplicación.
            </Text>
          </>
        )}
      </View>


      {/* Recetas favoritas (solo para usuarios logueados) */}
      {isLoggedIn && favorites.length > 0 && (
        <View style={styles.favoritesSection}>
          <SectionTitle 
            text="Mis Recetas Favoritas" 
            color={themeColor}
            align="left"
          />
          <Text style={styles.favoritesCount}>
            Tienes {favorites.length} receta{favorites.length !== 1 ? 's' : ''} favorita{favorites.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.favoritesList}>
            {favorites.slice(0, 3).map(favoriteId => {
              const recipe = RECIPES.find(r => r.id === favoriteId);
              if (!recipe) return null;
              
              return (
                <TouchableOpacity
                  key={favoriteId}
                  style={styles.favoriteItem}
                  onPress={() => navigation.navigate('RecipeDetail', { 
                    id: favoriteId,
                    title: recipe.title
                  })}
                >
                  <Ionicons name="heart" size={16} color="#FF6B6B" />
                  <Text style={styles.favoriteText} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {favorites.length > 3 && (
              <Text style={styles.moreFavorites}>
                y {favorites.length - 3} más...
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Acerca de la aplicación</Text>
        <Text style={styles.infoText}>
          • Busca recetas por ingredientes que tengas en casa{'\n'}
          • Filtra por precio: bajo, medio o alto{'\n'}
          • Guarda tus recetas favoritas{'\n'}
          • Modo ahorro: solo recetas económicas
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  actionsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  sessionInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loginPrompt: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  favoritesSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffebeb',
  },
  favoritesCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  favoritesList: {
    gap: 8,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  favoriteText: {
    marginLeft: 8,
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
  moreFavorites: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0e7ff',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});