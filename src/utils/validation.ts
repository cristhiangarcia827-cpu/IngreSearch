// Tipos para validación
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// Validaciones básicas
export const isRequired = (value?: string): ValidationResult => {
  const isValid = value != null && value.trim().length > 0;
  return {
    isValid,
    message: isValid ? undefined : 'Este campo es obligatorio'
  };
};

export const isEmailValid = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  return {
    isValid,
    message: isValid ? undefined : 'Por favor ingresa un email válido'
  };
};

// Nuevas validaciones para el registro
export const isStrongPassword = (password: string): ValidationResult => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers;

  if (!isValid) {
    let message = 'La contraseña debe tener:';
    if (!hasMinLength) message += '\n• Al menos 8 caracteres';
    if (!hasUpperCase) message += '\n• Una letra mayúscula';
    if (!hasLowerCase) message += '\n• Una letra minúscula';
    if (!hasNumbers) message += '\n• Al menos un número';
    
    return { isValid, message };
  }

  return { isValid: true };
};

export const isNameValid = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  const isValid = trimmedName.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmedName);
  return {
    isValid,
    message: isValid ? undefined : 'El nombre debe tener al menos 2 caracteres y solo letras'
  };
};

export const doPasswordsMatch = (password: string, confirmPassword: string): ValidationResult => {
  const isValid = password === confirmPassword;
  return {
    isValid,
    message: isValid ? undefined : 'Las contraseñas no coinciden'
  };
};

// Función helper para validar campos específicos
export const validateField = (fieldName: string, value: string, confirmValue?: string): ValidationResult => {
  switch (fieldName) {
    case 'name':
      return isNameValid(value);
    case 'email':
      return isEmailValid(value);
    case 'password':
      return isStrongPassword(value);
    case 'confirmPassword':
      if (!confirmValue) return { isValid: false, message: 'Confirma tu contraseña' };
      return doPasswordsMatch(value, confirmValue);
    default:
      return isRequired(value);
  }
};

// Validador compuesto para formularios completos
export const validateForm = (fields: Record<string, string>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validar campos requeridos
  Object.entries(fields).forEach(([field, value]) => {
    if (field !== 'confirmPassword') {
      const requiredValidation = isRequired(value);
      if (!requiredValidation.isValid) {
        errors[field] = requiredValidation.message || 'Este campo es obligatorio';
      }
    }
  });

  // Validaciones específicas
  if (fields.name) {
    const nameValidation = isNameValid(fields.name);
    if (!nameValidation.isValid && !errors.name) {
      errors.name = nameValidation.message || '';
    }
  }

  if (fields.email) {
    const emailValidation = isEmailValid(fields.email);
    if (!emailValidation.isValid && !errors.email) {
      errors.email = emailValidation.message || '';
    }
  }

  if (fields.password) {
    const passwordValidation = isStrongPassword(fields.password);
    if (!passwordValidation.isValid && !errors.password) {
      errors.password = passwordValidation.message || '';
    }
  }

  if (fields.password && fields.confirmPassword) {
    const matchValidation = doPasswordsMatch(fields.password, fields.confirmPassword);
    if (!matchValidation.isValid && !errors.confirmPassword) {
      errors.confirmPassword = matchValidation.message || '';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};