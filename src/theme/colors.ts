export const lightColors = {
  primary: '#FF7A00',
  savingsPrimary: '#2E8B57',
  bg: '#FAFAFA',
  savingsBg: '#F1FFF5',
  error: '#D32F2F',
  textPrimary: '#333333',
  disabled: '#CCCCCC',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  lightGray: '#F0F0F0',
  cardBg: '#FFFFFF',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

export const darkColors = {
  primary: '#FF9A3D',
  savingsPrimary: '#3CAF6B',
  bg: '#121212',
  savingsBg: '#1A2C24',
  error: '#FF5252',
  textPrimary: '#FFFFFF',
  disabled: '#555555',
  white: '#121212',
  black: '#FFFFFF',
  gray: '#AAAAAA',
  lightGray: '#2A2A2A',
  cardBg: '#1E1E1E',
  border: '#333333',
  success: '#66BB6A',
  warning: '#FFB74D',
  info: '#64B5F6',
};

export type ColorTheme = 'light' | 'dark' | 'system';

export const getColors = (theme: 'light' | 'dark') => {
  return theme === 'dark' ? darkColors : lightColors;
};

export const colors = lightColors;