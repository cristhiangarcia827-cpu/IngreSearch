import React, { useState } from 'react';
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
    name: currentUser?.name || '',
    email: currentUser?.email || '',
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

  const themeColor = mode === 'ahorro' ? colors.savingsPrimary : colors.primary;
  const backgroundColor = mode === 'ahorro' ? colors.savingsBg : colors.bg;
  const isLoggedIn = !!currentUser;

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real después de que el campo fue tocado
    if (touched[field as keyof typeof touched]) {
      const validation = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: validation.message || '' }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const validation = validateField(field, formData[field as keyof typeof formData]);
    setErrors(prev => ({ ...prev, [field]: validation.message || '' }));
  };

  const validateFormData = () => {
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

    // Validar contraseña (solo si se ingresó y no es el usuario actual)
    if (formData.password && !isLoggedIn) {
      const passwordValidation = isStrongPassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message || '';
      }
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

    try {
      // Aquí iría la lógica para actualizar el perfil en Supabase
      // Por ahora, solo actualizamos Redux
      
      if (isLoggedIn && currentUser) {
        // Actualizar usuario existente
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          email: formData.email,
        };
        
        dispatch(setCurrentUser(updatedUser));
        
        Alert.alert(
          'Perfil actualizado', 
          'Tu información se ha guardado correctamente.',
          [{ text: 'OK' }]
        );
      } else {
        // Crear nuevo usuario (esto sería para registro, pero manejado aquí)
        Alert.alert(
          'No autenticado', 
          'Por favor inicia sesión primero.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la información.');
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
            Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
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
          />

          {isLoggedIn && (
            <CustomButton
              text="Guardar Cambios"
              onPress={handleSaveProfile}
              variant={mode === 'ahorro' ? 'savings' : 'primary'}
              disabled={hasErrors}
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
            </>
          )}
        </View>

        {/* Estadísticas */}
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
  },
});