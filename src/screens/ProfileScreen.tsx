import React from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Text,
  TouchableOpacity,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import SectionTitle from '../components/SectionTitle';
import CustomButton from '../components/CustomButton';
import { logoutUser, setColorTheme } from '../store/slices/uiSlice';
import { RECIPES } from '../data/recipes';
import type { RootState, AppDispatch } from '../store';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../hooks/useTheme';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener usuario actual de Redux
  const mode = useSelector((state: RootState) => state.ui.mode);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  const favorites = useSelector((state: RootState) => state.ui.favorites);

  // Usar hook de tema
  const { colors, themeColor, backgroundColor, isDarkMode } = useTheme();

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

  const handleToggleDarkMode = () => {
    dispatch(setColorTheme(isDarkMode ? 'light' : 'dark'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top']}>
      <ScrollView 
        style={styles.container}
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
            <Text style={[styles.welcomeText, { color: colors.gray }]}>
              Inicia sesión para guardar tus recetas favoritas y personalizar tu perfil.
            </Text>
          )}
        </View>

        {/* Acciones de cuenta */}
        <View style={[styles.actionsSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <SectionTitle 
            text="Cuenta" 
            color={themeColor}
            align="left"
            size="small"
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
              
              <Text style={[styles.sessionInfo, { color: colors.gray }]}>
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
              
              <Text style={[styles.loginPrompt, { color: colors.gray }]}>
                Inicia sesión para acceder a todas las funciones de la aplicación.
              </Text>
            </>
          )}
        </View>

        {/* Configuración de Tema - SIMPLIFICADA */}
        <View style={[styles.settingsSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <SectionTitle 
            text="Modo de Visualización" 
            color={themeColor}
            align="left"
            size="small"
          />
          
          {/* Switch para claro/oscuro */}
          <View style={[styles.themeToggleRow, { borderBottomColor: colors.border }]}>
            <View style={styles.themeToggleInfo}>
              <Ionicons 
                name={isDarkMode ? "moon" : "sunny"} 
                size={28} 
                color={themeColor} 
              />
              <View style={styles.themeToggleTextContainer}>
                <Text style={[styles.themeToggleLabel, { color: colors.textPrimary }]}>
                  {isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}
                </Text>
                <Text style={[styles.themeToggleDescription, { color: colors.gray }]}>
                  {isDarkMode 
                    ? 'Interfaz con colores oscuros para mejor visibilidad nocturna'
                    : 'Interfaz con colores claros para mejor visibilidad diurna'
                  }
                </Text>
              </View>
            </View>
            
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: colors.lightGray, true: themeColor }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.lightGray}
            />
          </View>

          {/* Indicador visual del tema actual */}
          <View style={styles.themePreview}>
            <View style={[
              styles.themePreviewLight, 
              { 
                backgroundColor: colors.white, 
                borderColor: !isDarkMode ? themeColor : colors.border,
                opacity: !isDarkMode ? 1 : 0.5 
              }
            ]}>
              <Ionicons name="sunny" size={20} color={!isDarkMode ? themeColor : colors.gray} />
              <Text style={[
                styles.themePreviewText, 
                { color: !isDarkMode ? colors.textPrimary : colors.gray }
              ]}>
                Claro
              </Text>
            </View>
            
            <View style={[
              styles.themePreviewDark, 
              { 
                backgroundColor: colors.bg, 
                borderColor: isDarkMode ? themeColor : colors.border,
                opacity: isDarkMode ? 1 : 0.5 
              }
            ]}>
              <Ionicons name="moon" size={20} color={isDarkMode ? themeColor : colors.gray} />
              <Text style={[
                styles.themePreviewText, 
                { color: isDarkMode ? colors.textPrimary : colors.gray }
              ]}>
                Oscuro
              </Text>
            </View>
          </View>

          <Text style={[styles.themeNote, { color: colors.gray }]}>
            El cambio se aplica inmediatamente a toda la aplicación
          </Text>
        </View>

        {/* Estadísticas (solo para usuarios logueados) */}
        {isLoggedIn && (
          <View style={[styles.statsSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <SectionTitle 
              text="Mis Estadísticas" 
              color={themeColor}
              align="left"
              size="small"
            />
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: themeColor }]}>12</Text>
                <Text style={[styles.statLabel, { color: colors.gray }]}>Recetas probadas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: themeColor }]}>{favorites.length}</Text>
                <Text style={[styles.statLabel, { color: colors.gray }]}>Favoritas</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recetas favoritas (solo para usuarios logueados) */}
        {isLoggedIn && favorites.length > 0 && (
          <View style={[styles.favoritesSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <SectionTitle 
              text="Mis Recetas Favoritas" 
              color={themeColor}
              align="left"
              size="small"
            />
            <Text style={[styles.favoritesCount, { color: colors.gray }]}>
              Tienes {favorites.length} receta{favorites.length !== 1 ? 's' : ''} favorita{favorites.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.favoritesList}>
              {favorites.slice(0, 3).map(favoriteId => {
                const recipe = RECIPES.find(r => r.id === favoriteId);
                if (!recipe) return null;
                
                return (
                  <TouchableOpacity
                    key={favoriteId}
                    style={[styles.favoriteItem, { backgroundColor: colors.lightGray, borderColor: colors.border }]}
                    onPress={() => navigation.navigate('RecipeDetail', { 
                      id: favoriteId,
                      title: recipe.title
                    })}
                  >
                    <Ionicons name="heart" size={16} color="#FF6B6B" />
                    <Text style={[styles.favoriteText, { color: colors.textPrimary }]} numberOfLines={1}>
                      {recipe.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              
              {favorites.length > 3 && (
                <Text style={[styles.moreFavorites, { color: colors.gray }]}>
                  y {favorites.length - 3} más...
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Información adicional */}
        <View style={[styles.infoSection, { backgroundColor: colors.lightGray, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>
            Acerca de la aplicación
          </Text>
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>
            • Busca recetas por ingredientes que tengas en casa{'\n'}
            • Filtra por precio: bajo, medio o alto{'\n'}
            • Guarda tus recetas favoritas{'\n'}
            • Modo ahorro: solo recetas económicas
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  actionsSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButton: {
    marginBottom: 12,
  },
  sessionInfo: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loginPrompt: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  favoritesSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  favoritesCount: {
    fontSize: 14,
    marginBottom: 12,
  },
  favoritesList: {
    gap: 8,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  favoriteText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  moreFavorites: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingsSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  themeToggleInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  themeToggleTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  themeToggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeToggleDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  themePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  themePreviewLight: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  themePreviewDark: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  themePreviewText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  themeNote: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});