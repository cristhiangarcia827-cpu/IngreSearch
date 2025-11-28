import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text // Asegurarse de que Text esté importado
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { validateField, isRequired, isEmailValid, isStrongPassword, doPasswordsMatch } from '../utils/validation';
import { colors } from '../theme/colors';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  
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
    
    // Validación en tiempo real después de que el campo fue tocado
    if (touched[field as keyof typeof touched]) {
      let validation;
      
      if (field === 'confirmPassword') {
        validation = doPasswordsMatch(formData.password, value);
      } else {
        validation = validateField(field, value);
      }
      
      setErrors(prev => ({ ...prev, [field]: validation.message || '' }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let validation;
    
    if (field === 'confirmPassword') {
      validation = doPasswordsMatch(formData.password, formData.confirmPassword);
    } else {
      validation = validateField(field, formData[field as keyof typeof formData]);
    }
    
    setErrors(prev => ({ ...prev, [field]: validation.message || '' }));
  };

  const validateFormData = () => {
    // Marcar todos los campos como tocados
    const newTouched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    };
    setTouched(newTouched);

    // Validación manual de cada campo
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
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
    const passwordValidation = isStrongPassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message || '';
    }

    // Validar confirmación de contraseña
    const confirmValidation = doPasswordsMatch(formData.password, formData.confirmPassword);
    if (!confirmValidation.isValid) {
      newErrors.confirmPassword = confirmValidation.message || '';
    }

    setErrors(newErrors);

    // Verificar si no hay errores
    const isValid = Object.values(newErrors).every(error => error === '');
    return isValid;
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

    // Simular proceso de registro (aquí iría la llamada a tu API)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Registro exitoso
      Alert.alert(
        'Registro exitoso', 
        'Tu cuenta ha sido creada correctamente.',
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
        'No se pudo crear la cuenta. Inténtalo de nuevo.'
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
          text="Crear Cuenta" 
          color={colors.primary}
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
    backgroundColor: colors.bg,
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