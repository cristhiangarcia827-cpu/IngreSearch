import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../navigation/RootNavigator';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { isRequired, isEmailValid, isStrongPassword, doPasswordsMatch } from '../utils/validation';
import { useTheme } from '../hooks/useTheme'; // Usar hook de tema
import { supabase } from '../lib/supabase';
import { loadFavorites, setCurrentUser } from '../store/slices/uiSlice';
import type { AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Usar hook de tema
  const { colors, themeColor, backgroundColor } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [loading, setLoading] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
        validation = isStrongPassword(currentValue);
        break;
      case 'confirmPassword':
        validation = doPasswordsMatch(formData.password, currentValue);
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
    const newTouched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    };
    setTouched(newTouched);

    Object.keys(formData).forEach(field => {
      validateField(field);
    });

    const isValid = Object.values(errors).every(error => error === '');
    return isValid;
  };

  // Función simple para hashear
  const simpleHash = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const handleRegister = async () => {
    if (!validateFormData()) {
      Alert.alert(
        'Datos incompletos', 
        'Por favor completa todos los campos correctamente.'
      );
      return;
    }

    setLoading(true);

    try {
      console.log('Iniciando registro para:', formData.email);

      // 1. Primero verificar si el usuario ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        Alert.alert('Error', 'Este email ya está registrado.');
        setLoading(false);
        return;
      }

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error al verificar usuario:', checkError);
      }

      // 2. Hashear la contraseña
      const passwordHash = simpleHash(formData.password);
      console.log('Contraseña hasheada');

      // 3. Insertar el nuevo usuario en la tabla
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            password_hash: passwordHash,
          }
        ])
        .select();

      if (error) {
        console.error('Error al registrar usuario:', error);
        Alert.alert('Error', `No se pudo crear la cuenta: ${error.message}`);
        return;
      }

      console.log('Usuario registrado exitosamente:', data);

      // 4. Guardar usuario en Redux y cargar favoritos
      if (data && data[0]) {
        const newUser = data[0];
        dispatch(setCurrentUser({
          id: newUser.id,
          name: formData.name,
          email: formData.email
        }));
        
        // Cargar favoritos del nuevo usuario
        dispatch(loadFavorites(newUser.id));
      }

      // 5. Registro exitoso
      Alert.alert(
        'Registro exitoso', 
        `Hola ${formData.name}, tu cuenta ha sido creada correctamente.`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Tabs') 
          }
        ]
      );

    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
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
        <SectionTitle 
          text="Crear Cuenta" 
          color={themeColor}
          align="center"
        />

        <View style={styles.formContainer}>
          <CustomInput
            label="Nombre completo"
            placeholder="Ingresa tu nombre completo"
            value={formData.name}
            onChangeText={(text) => handleFieldChange('name', text)}
            onBlur={() => handleFieldBlur('name')}
            error={errors.name}
            required
            autoCapitalize="words"
          />

          <CustomInput
            label="Email"
            placeholder="nombre@ejemplo.com"
            value={formData.email}
            onChangeText={(text) => handleFieldChange('email', text)}
            onBlur={() => handleFieldBlur('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          <CustomInput
            label="Contraseña"
            placeholder="Crea una contraseña segura"
            value={formData.password}
            onChangeText={(text) => handleFieldChange('password', text)}
            onBlur={() => handleFieldBlur('password')}
            error={errors.password}
            secureTextEntry
            showCharacterCount
            maxLength={20}
            required
          />

          <CustomInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChangeText={(text) => handleFieldChange('confirmPassword', text)}
            onBlur={() => handleFieldBlur('confirmPassword')}
            error={errors.confirmPassword}
            secureTextEntry
            required
          />

          <CustomButton
            text="Crear Cuenta"
            onPress={handleRegister}
            variant="primary"
            disabled={hasErrors}
            loading={loading}
            style={styles.registerButton}
          />

          <CustomButton
            text="¿Ya tienes cuenta? Inicia Sesión"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            style={styles.loginButton}
          />
        </View>
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
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 8,
  },
});