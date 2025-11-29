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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { isRequired, isEmailValid } from '../utils/validation';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);

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
      case 'email':
        validation = isEmailValid(currentValue);
        break;
      case 'password':
        validation = isRequired(currentValue);
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
      email: true,
      password: true,
    };
    setTouched(newTouched);

    // Validar todos los campos
    Object.keys(formData).forEach(field => {
      validateField(field);
    });

    // Verificar si no hay errores
    const isValid = Object.values(errors).every(error => error === '');
    return isValid;
  };

  // Función simple para hashear (debe ser la misma que en RegisterScreen)
  const simpleHash = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const handleLogin = async () => {
    if (!validateFormData()) {
      Alert.alert(
        'Datos incompletos', 
        'Por favor completa todos los campos correctamente.'
      );
      return;
    }

    setLoading(true);

    try {
      console.log('Iniciando login para:', formData.email);

      // 1. Hashear la contraseña para comparar con la base de datos
      const passwordHash = simpleHash(formData.password);

      // 2. Buscar usuario en la base de datos
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, password_hash')
        .eq('email', formData.email)
        .eq('password_hash', passwordHash)
        .single();

      if (error) {
        console.error('Error al buscar usuario:', error);
        
        if (error.code === 'PGRST116') {
          // Usuario no encontrado
          Alert.alert('Error', 'Email o contraseña incorrectos.');
        } else {
          Alert.alert('Error', 'Ocurrió un error al iniciar sesión.');
        }
        return;
      }

      if (!user) {
        Alert.alert('Error', 'Email o contraseña incorrectos.');
        return;
      }

      console.log('Login exitoso para:', user.name);

      // 3. Login exitoso
      Alert.alert(
        '¡Bienvenido!', 
        `Hola ${user.name}, has iniciado sesión correctamente.`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Tabs') 
          }
        ]
      );

    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Se enviará un enlace de recuperación a tu email.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => {
          // Aquí iría la lógica para recuperar contraseña
          Alert.alert('Éxito', 'Se ha enviado el enlace de recuperación a tu email.');
        }}
      ]
    );
  };

  const hasErrors = Object.values(errors).some(error => error !== '');

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle 
          text="Iniciar Sesión" 
          color={colors.primary}
          align="center"
        />

        <View style={styles.formContainer}>
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
            autoComplete="email"
          />

          <CustomInput
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChangeText={(text) => handleFieldChange('password', text)}
            onBlur={() => handleFieldBlur('password')}
            error={errors.password}
            secureTextEntry
            required
            autoComplete="password"
          />

          <CustomButton
            text="Iniciar Sesión"
            onPress={handleLogin}
            variant="primary"
            disabled={hasErrors}
            loading={loading}
            style={styles.loginButton}
          />

          <CustomButton
            text="¿Olvidaste tu contraseña?"
            onPress={handleForgotPassword}
            variant="text"
            fullWidth={false}
            style={styles.forgotButton}
          />

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.separatorLine} />
          </View>

          <CustomButton
            text="Crear una cuenta nueva"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            style={styles.registerButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    justifyContent: 'center',
    minHeight: '100%',
  },
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 12,
  },
  forgotButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 16,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  separatorText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
});