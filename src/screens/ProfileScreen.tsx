import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { validateField, isRequired, isEmailValid, isStrongPassword } from '../utils/validation';
import { colors } from '../theme/colors';
import { setCurrentUser, logoutUser } from '../store/slices/uiSlice';
import { supabase } from '../lib/supabase';
import type { RootState, AppDispatch } from '../store';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener usuario actual de Redux
  const mode = useSelector((state: RootState) => state.ui.mode);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const themeColor = mode === 'ahorro' ? colors.savingsPrimary : colors.primary;
  const backgroundColor = mode === 'ahorro' ? colors.savingsBg : colors.bg;
  const isLoggedIn = !!currentUser;

  // Función simple para hashear (debe ser la misma que en LoginScreen y RegisterScreen)
  const simpleHash = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  // Cargar datos del usuario cuando cambie
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
      });
    }
  }, [currentUser]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real después de que el campo fue tocado
    if (touched[field as keyof typeof touched]) {
      validateField(field, value);
    }
  };

  const validateField = (field: string, value?: string) => {
    const currentValue = value !== undefined ? value : formData[field as keyof typeof formData];
    let validation;

    switch (field) {
      case 'name':
        validation = isRequired(currentValue);
        break;
      case 'email':
        validation = isEmailValid(currentValue);
        break;
      case 'password':
        // Solo validar si se ingresó una nueva contraseña
        if (currentValue && isLoggedIn) {
          validation = isStrongPassword(currentValue);
        } else if (!isLoggedIn) {
          validation = isRequired(currentValue);
        } else {
          validation = { isValid: true, message: '' };
        }
        break;
      default:
        validation = isRequired(currentValue);
    }

    setErrors(prev => ({ 
      ...prev, 
      [field]: validation.message || '' 
    }));
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateFormData = () => {
    // Marcar todos los campos como tocados
    const newTouched = {
      name: true,
      email: true,
      password: true,
    };
    setTouched(newTouched);

    // Validación manual de cada campo
    const newErrors = {
      name: '',
      email: '',
      password: '',
    };

    // Validar nombre
    const nameValidation = isRequired(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message || '';
    }

    // Validar email
    const emailValidation = isEmailValid(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message || '';
    }

    // Validar contraseña
    if (formData.password && isLoggedIn) {
      const passwordValidation = isStrongPassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message || '';
      }
    }

    // Validar contraseña para usuarios no logueados
    if (!isLoggedIn && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);

    // Verificar si no hay errores
    const isValid = Object.values(newErrors).every(error => error === '');
    return isValid;
  };

  const handleSaveProfile = async () => {
    if (!validateFormData()) {
      Alert.alert(
        'Datos incompletos', 
        'Por favor completa todos los campos requeridos correctamente.'
      );
      return;
    }

    setUpdating(true);

    try {
      if (!isLoggedIn || !currentUser) {
        Alert.alert('Error', 'Debes iniciar sesión para actualizar tu perfil.');
        return;
      }

      // Preparar datos para actualizar
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      // Si se ingresó una nueva contraseña, hashearla
      if (formData.password) {
        updateData.password_hash = simpleHash(formData.password);
      }

      // Actualizar usuario en Supabase
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id)
        .select();

      if (error) {
        console.error('Error al actualizar usuario:', error);
        Alert.alert('Error', 'No se pudo actualizar tu perfil. Inténtalo de nuevo.');
        return;
      }

      if (data && data[0]) {
        // Actualizar usuario en Redux
        dispatch(setCurrentUser({
          id: data[0].id,
          name: data[0].name,
          email: data[0].email
        }));

        Alert.alert(
          'Perfil actualizado', 
          'Tu información se ha guardado correctamente.',
          [{ text: 'OK' }]
        );
        
        // Limpiar campo de contraseña después de guardar
        setFormData(prev => ({ ...prev, password: '' }));
      }

    } catch (error) {
      console.error('Error en actualización:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setUpdating(false);
    }
  };

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

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const hasErrors = Object.values(errors).some(error => error !== '');

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
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

        {/* Formulario de perfil */}
        <View style={styles.formSection}>
          <SectionTitle 
            text="Información Personal" 
            color={themeColor}
            align="left"
          />

          <CustomInput
            label="Nombre completo"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChangeText={(text) => handleFieldChange('name', text)}
            onBlur={() => handleFieldBlur('name')}
            error={errors.name}
            required
            autoCapitalize="words"
            editable={isLoggedIn}
          />

          <CustomInput
            label="Email"
            placeholder="nombre@dominio.com"
            value={formData.email}
            onChangeText={(text) => handleFieldChange('email', text)}
            onBlur={() => handleFieldBlur('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            required
            editable={isLoggedIn}
          />

          <CustomInput
            label={isLoggedIn ? "Nueva contraseña (opcional)" : "Contraseña"}
            placeholder={isLoggedIn ? "Dejar en blanco para no cambiar" : "••••••••"}
            value={formData.password}
            onChangeText={(text) => handleFieldChange('password', text)}
            onBlur={() => handleFieldBlur('password')}
            error={errors.password}
            secureTextEntry
            showCharacterCount
            maxLength={20}
            required={!isLoggedIn}
            editable={true}
          />

          {isLoggedIn && (
            <CustomButton
              text={updating ? "Guardando..." : "Guardar Cambios"}
              onPress={handleSaveProfile}
              variant={mode === 'ahorro' ? 'savings' : 'primary'}
              disabled={hasErrors || updating}
              loading={updating}
              style={styles.saveButton}
            />
          )}
        </View>

        {/* Sección de autenticación */}
        <View style={styles.authSection}>
          <SectionTitle 
            text="Cuenta" 
            color={themeColor}
            align="left"
          />
          
          {isLoggedIn ? (
            <>
              <CustomButton
                text="Cerrar Sesión"
                onPress={handleLogout}
                variant="outline"
                style={styles.authButton}
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
                style={styles.authButton}
              />

              <CustomButton
                text="Crear Cuenta"
                onPress={handleRegister}
                variant="savings"
                style={styles.authButton}
              />
              
              <Text style={styles.loginPrompt}>
                Inicia sesión para acceder a todas las funciones de la aplicación.
              </Text>
            </>
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
                <Text style={styles.statLabel}>Recetas Vistas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Favoritas</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  formSection: {
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  authSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  authButton: {
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
    marginTop: 16,
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
});