import React, { useMemo, useEffect, useCallback } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  Image,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import SectionTitle from '../components/SectionTitle';
import RecipeCard from '../components/RecipeCard';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/RootNavigator';
import { loadFavorites } from '../store/slices/uiSlice';
import {
  selectHomeScreenData,
  selectIsSavingsMode
} from '../store/selectors';
import type { AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, themeColor, backgroundColor } = useTheme();

  const { 
    currentUser, 
    featuredRecipes, 
    isLoggedIn 
  } = useSelector(selectHomeScreenData);
  
  const isSavingsMode = useSelector(selectIsSavingsMode);

  useEffect(() => {
    if (currentUser) {
      dispatch(loadFavorites(currentUser.id));
    }
  }, [currentUser, dispatch]);

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation.navigate('RecipeDetail', { 
      id: recipeId,
      title: featuredRecipes.find(recipe => recipe.id === recipeId)?.title
    });
  }, [navigation, featuredRecipes]);

  const navigateToRecipes = useCallback(() => {
    navigation.navigate('Tabs', { screen: 'Recetas' } as any);
  }, [navigation]);

  const navigateToSearch = useCallback(() => {
    navigation.navigate('Tabs', { screen: 'Buscar' } as any);
  }, [navigation]);

  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const navigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const welcomeMessage = useMemo(() => {
    if (currentUser) {
      const hour = new Date().getHours();
      if (hour < 12) return `¡Buenos días, ${currentUser.name}!`;
      if (hour < 19) return `¡Buenas tardes, ${currentUser.name}!`;
      return `¡Buenas noches, ${currentUser.name}!`;
    }
    return '¡Bienvenido a IngreSearch!';
  }, [currentUser]);

  const userGreeting = useMemo(() => {
    if (currentUser) {
      return `Hola, ${currentUser.name.split(' ')[0]}`;
    }
    return 'Explora recetas deliciosas';
  }, [currentUser]);

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <SectionTitle
            text={welcomeMessage}
            color={themeColor}
            align="left"
            size="large"
          />
        </View>

        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <View>
              <SectionTitle
                text="Recetas Destacadas"
                color={themeColor}
                size="small"
                align="left"
              />
              <Text style={[styles.featuredSubtitle, { color: colors.gray }]}>
                Las recetas más populares
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToRecipes}
            >
              <Text style={[styles.viewAllText, { color: themeColor }]}>
                Ver todas
              </Text>
              <Ionicons name="chevron-forward" size={16} color={themeColor} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.recipesList}>
            {featuredRecipes.length > 0 ? (
              featuredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  priceTag={recipe.priceTag}
                  onPress={handleRecipePress}
                  recipeId={recipe.id}
                  style={styles.recipeCard}
                />
              ))
            ) : (
              <EmptyState
                icon="restaurant-outline"
                title="No hay recetas destacadas disponibles"
                subtitle="Pronto agregaremos nuevas recetas"
                style={styles.emptyState}
              />
            )}
          </View>
        </View>

        <View style={[styles.benefitsSection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.benefitsTitle, { color: themeColor }]}>
            ¿Por qué usar nuestra app?
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: themeColor + '20' }]}>
                <Ionicons name="cash-outline" size={20} color={themeColor} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitItemTitle, { color: colors.textPrimary }]}>
                  Recetas económicas
                </Text>
                <Text style={[styles.benefitItemText, { color: colors.gray }]}>
                  Encuentra recetas con ingredientes accesibles
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: themeColor + '20' }]}>
                <Ionicons name="heart-outline" size={20} color={themeColor} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitItemTitle, { color: colors.textPrimary }]}>
                  Guarda tus favoritas
                </Text>
                <Text style={[styles.benefitItemText, { color: colors.gray }]}>
                  Crea tu colección personal de recetas
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: themeColor + '20' }]}>
                <Ionicons name="time-outline" size={20} color={themeColor} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitItemTitle, { color: colors.textPrimary }]}>
                  Fácil y rápido
                </Text>
                <Text style={[styles.benefitItemText, { color: colors.gray }]}>
                  Encuentra recetas en segundos
                </Text>
              </View>
            </View>
          </View>
        </View>

        {!isLoggedIn && (
          <View style={[styles.loginPrompt, { backgroundColor: colors.cardBg + '80', borderColor: colors.border }]}>
            <View style={styles.loginHeader}>
              <Ionicons name="person-circle" size={32} color={themeColor} />
              <View style={styles.loginTextContainer}>
                <Text style={[styles.loginTitle, { color: colors.textPrimary }]}>
                  ¡Únete a nuestra comunidad!
                </Text>
                <Text style={[styles.loginDescription, { color: colors.gray }]}>
                  Guarda tus recetas favoritas y personaliza tu experiencia
                </Text>
              </View>
            </View>
            <View style={styles.loginButtons}>
              <CustomButton
                text="Iniciar sesión"
                onPress={navigateToLogin}
                variant="outline"
                style={styles.loginButton}
              />
              <CustomButton
                text="Crear cuenta"
                onPress={navigateToRegister}
                variant={isSavingsMode ? 'savings' : 'primary'}
                style={styles.registerButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  userInfoCard: {
    marginBottom: 20,
  },
  image: { 
    width: 200, 
    height: 200, 
    alignSelf: 'center', 
    marginVertical: 16 
  },
  mainActions: {
    marginBottom: 32,
    gap: 12,
  },
  mainButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 4,
  },
  featuredSection: {
    marginBottom: 32,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featuredSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 2,
  },
  recipesList: {
    gap: 12,
  },
  recipeCard: {
    marginBottom: 8,
  },
  emptyState: {
    marginVertical: 20,
  },
  benefitsSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitItemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loginPrompt: {
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  loginTextContainer: {
    flex: 1,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loginDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  loginButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loginButton: {
    flex: 1,
  },
  registerButton: {
    flex: 1,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});