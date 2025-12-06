import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabsNavigator from './TabsNavigator';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

export type RootStackParamList = {
  Tabs: undefined;
  RecipeDetail: { id: string; title?: string };
  Register: undefined;
  Login: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Detalle de receta' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear Cuenta' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar Perfil' }} />
    </Stack.Navigator>
  );
}