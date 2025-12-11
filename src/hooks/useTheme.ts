import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useColorScheme } from 'react-native';
import { RootState, AppDispatch } from '../store';
import { setSystemColorScheme } from '../store/slices/uiSlice';
import { getColors, ColorTheme } from '../theme/colors';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const systemColorScheme = useColorScheme();
  const colorTheme = useSelector((state: RootState) => state.ui.colorTheme);
  const storedSystemScheme = useSelector((state: RootState) => state.ui.systemColorScheme);
  const mode = useSelector((state: RootState) => state.ui.mode);

  // Detectar cambios en el tema del sistema
  useEffect(() => {
    if (systemColorScheme && systemColorScheme !== storedSystemScheme) {
      dispatch(setSystemColorScheme(systemColorScheme));
    }
  }, [systemColorScheme, storedSystemScheme, dispatch]);

  // Determinar el tema activo
  const activeTheme: 'light' | 'dark' = 
    colorTheme === 'system' 
      ? (systemColorScheme || storedSystemScheme || 'light')
      : colorTheme;

  // Obtener colores según tema activo
  const colors = getColors(activeTheme);

  // Colores específicos para modo ahorro
  const themeColor = mode === 'ahorro' ? colors.savingsPrimary : colors.primary;
  const backgroundColor = mode === 'ahorro' ? colors.savingsBg : colors.bg;

  return {
    colors,
    themeColor,
    backgroundColor,
    activeTheme,
    colorTheme,
    systemColorScheme: systemColorScheme || storedSystemScheme,
    isDarkMode: activeTheme === 'dark',
  };
};