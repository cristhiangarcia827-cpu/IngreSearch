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
import { validateField, isRequired, isEmailValid } from '../utils/validation';
import { colors } from '../theme/colors';

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
    // Marcar todos los campos como tocados
    const newTouched = {
      email: true,
      password: true,
    };
    setTouched(newTouched);

    // Validación manual de cada campo
    const newErrors = {
      email: '',
      password: '',
    };

    // Validar email
    const emailValidation = isEmailValid(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message || '';
    }

    // Validar contraseña
    const passwordValidation = isRequired(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message || '';
    }

    setErrors(newErrors);

    // Verificar si no hay errores
    const isValid = Object.values(newErrors).every(error => error === '');
    return isValid;
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

    // Simular proceso de login (aquí iría la llamada a tu API)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Login exitoso
      Alert.alert(
        '¡Bienvenido!', 
        'Has iniciado sesión correctamente.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Tabs') 
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error', 
        'No se pudo iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
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