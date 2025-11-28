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
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { validateField, isRequired, isEmailValid, isStrongPassword } from '../utils/validation';
import { colors } from '../theme/colors';
import type { RootState } from '../store';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const mode = useSelector((state: RootState) => state.ui.mode);
  
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

  const themeColor = mode === 'ahorro' ? colors.savingsPrimary : colors.primary;
  const backgroundColor = mode === 'ahorro' ? colors.savingsBg : colors.bg;

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

    // Validar contraseña (solo si se ingresó)
    if (formData.password) {
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

  const submit = () => {
    if (!validateFormData()) {
      Alert.alert(
        'Datos incompletos', 
        'Por favor completa todos los campos requeridos correctamente.'
      );
      return;
    }

    Alert.alert(
      'Perfil actualizado', 
      'Tu información se ha guardado correctamente.',
      [{ text: 'OK' }]
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
        <SectionTitle 
          text="Mi Perfil" 
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
          label="Contraseña"
          placeholder="••••••••"
          value={formData.password}
          onChangeText={(text) => handleFieldChange('password', text)}
          onBlur={() => handleFieldBlur('password')}
          error={errors.password}
          secureTextEntry
          showCharacterCount
          maxLength={20}
        />

        <CustomButton
          text="Guardar Cambios"
          onPress={submit}
          variant={mode === 'ahorro' ? 'savings' : 'primary'}
          disabled={hasErrors}
          style={styles.saveButton}
        />

        {/* Sección de autenticación */}
        <View style={styles.authSection}>
          <SectionTitle 
            text="Cuenta" 
            color={themeColor}
            align="left"
          />
          
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
        </View>

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
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
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