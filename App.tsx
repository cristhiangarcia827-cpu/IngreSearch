import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { store, persistor } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { useTheme } from './src/hooks/useTheme';

function NavigationWrapper() {
  const { colors, isDarkMode } = useTheme();

  const navigationTheme = isDarkMode ? DarkTheme : DefaultTheme;
  
  const customTheme = {
    ...navigationTheme,
    colors: {
      ...navigationTheme.colors,
      primary: colors.primary,
      background: colors.bg,
      card: colors.cardBg,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <>
      <StatusBar 
        style={isDarkMode ? 'light' : 'dark'} 
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer theme={customTheme}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

const LoadingComponent = () => {
  const { colors } = useTheme();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<LoadingComponent />}
        persistor={persistor}
      >
        <NavigationWrapper />
      </PersistGate>
    </Provider>
  );
}