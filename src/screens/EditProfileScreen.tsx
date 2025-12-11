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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootStackParamList } from '../navigation/RootNavigator';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { isRequired, isEmailValid, isStrongPassword } from '../utils/validation';
import { useTheme } from '../hooks/useTheme';
import { setCurrentUser } from '../store/slices/uiSlice';
import { supabase } from '../lib/supabase';
import type { RootState, AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { colors, themeColor, backgroundColor } = useTheme();
  
  const mode = useSelector((state: RootState) => state.ui.mode);
  const currentUser = useSelector((state: RootState) => state.ui.currentUser);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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

  // Cargar datos del usuario
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
      }));
    } else {
      Alert.alert('Error', 'No hay usuario logueado');
      navigation.goBack();
    }
  }, [currentUser, navigation]);

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
      case 'currentPassword':
        validation = isRequired(currentValue);
        break;
      case 'newPassword':
        if (currentValue) {
          validation = isStrongPassword(currentValue);
        } else {
          validation = { isValid: true, message: '' };
        }
        break;
      case 'confirmPassword':
        if (formData.newPassword && currentValue !== formData.newPassword) {
          validation = { isValid: false, message: 'Las contraseñas no coinciden' };
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

  const validateForm = () => {
    // Marcar todos los campos como tocados
    const newTouched = {
      name: true,
      email: true,
      currentPassword: changingPassword,
      newPassword: changingPassword,
      confirmPassword: changingPassword,
    };
    setTouched(newTouched);

    // Validar todos los campos
    Object.keys(formData).forEach(field => {
      if (field === 'currentPassword' || field === 'newPassword' || field === 'confirmPassword') {
        if (changingPassword) {
          validateField(field);
        }
      } else {
        validateField(field);
      }
    });

    // Verificar si no hay errores
    const hasErrors = Object.entries(errors).some(([key, value]) => {
      if (key === 'currentPassword' || key === 'newPassword' || key === 'confirmPassword') {
        return changingPassword && value !== '';
      }
      return value !== '';
    });

    return !hasErrors;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      Alert.alert('Datos incompletos', 'Por favor corrige los errores en el formulario.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'No hay usuario logueado');
      return;
    }

    setLoading(true);

    try {
      // 1. Si está cambiando contraseña, verificar la contraseña actual
      if (changingPassword) {
        const currentPasswordHash = simpleHash(formData.currentPassword);
        
        const { data: user, error } = await supabase
          .from('users')
          .select('password_hash')
          .eq('id', currentUser.id)
          .eq('password_hash', currentPasswordHash)
          .single();

        if (error || !user) {
          Alert.alert('Error', 'La contraseña actual es incorrecta.');
          setLoading(false);
          return;
        }
      }

      // 2. Preparar datos para actualizar
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      // 3. Si está cambiando contraseña, actualizar también
      if (changingPassword && formData.newPassword) {
        updateData.password_hash = simpleHash(formData.newPassword);
      }

      // 4. Actualizar usuario en Supabase
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
        // 5. Actualizar usuario en Redux
        dispatch(setCurrentUser({
          id: data[0].id,
          name: data[0].name,
          email: data[0].email
        }));

        Alert.alert(
          'Perfil actualizado', 
          'Tu información se ha guardado correctamente.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack()
            }
          ]
        );
      }

    } catch (error) {
      console.error('Error en actualización:', error);
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
          text="Editar Perfil" 
          color={themeColor}
          align="center"
        />

        <View style={styles.formContainer}>
          {/* Información básica */}
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Información básica
          </Text>
          
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

          {/* Cambio de contraseña */}
          <View style={styles.passwordSection}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              Cambio de contraseña {!changingPassword && '(opcional)'}
            </Text>
            
            {!changingPassword ? (
              <CustomButton
                text="Cambiar contraseña"
                onPress={() => setChangingPassword(true)}
                variant="outline"
                style={styles.togglePasswordButton}
              />
            ) : (
              <>
                <CustomInput
                  label="Contraseña actual"
                  placeholder="Ingresa tu contraseña actual"
                  value={formData.currentPassword}
                  onChangeText={(text) => handleFieldChange('currentPassword', text)}
                  onBlur={() => handleFieldBlur('currentPassword')}
                  error={errors.currentPassword}
                  secureTextEntry
                  required={changingPassword}
                />

                <CustomInput
                  label="Nueva contraseña"
                  placeholder="Ingresa tu nueva contraseña"
                  value={formData.newPassword}
                  onChangeText={(text) => handleFieldChange('newPassword', text)}
                  onBlur={() => handleFieldBlur('newPassword')}
                  error={errors.newPassword}
                  secureTextEntry
                  showCharacterCount
                  maxLength={20}
                  required={changingPassword}
                />

                <CustomInput
                  label="Confirmar nueva contraseña"
                  placeholder="Confirma tu nueva contraseña"
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleFieldChange('confirmPassword', text)}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  error={errors.confirmPassword}
                  secureTextEntry
                  required={changingPassword}
                />

                <CustomButton
                  text="Cancelar cambio de contraseña"
                  onPress={() => {
                    setChangingPassword(false);
                    setFormData(prev => ({
                      ...prev,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    }));
                    setErrors(prev => ({
                      ...prev,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    }));
                  }}
                  variant="text"
                  style={styles.cancelPasswordButton}
                />
              </>
            )}
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <CustomButton
              text={loading ? "Guardando..." : "Guardar Cambios"}
              onPress={handleUpdateProfile}
              variant={mode === 'ahorro' ? 'savings' : 'primary'}
              disabled={hasErrors || loading}
              loading={loading}
              style={styles.saveButton}
            />

            <CustomButton
              text="Cancelar"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
            />
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
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  passwordSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  togglePasswordButton: {
    marginBottom: 16,
  },
  cancelPasswordButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  actionsContainer: {
    marginTop: 16,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
});