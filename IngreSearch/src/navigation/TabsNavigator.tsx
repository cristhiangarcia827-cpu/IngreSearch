
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type TabsParamList = {
  Normal: { mode: 'normal' } | undefined;
  Ahorro: { mode: 'ahorro' } | undefined;
  Perfil: undefined;
};

const Tabs = createBottomTabNavigator<TabsParamList>();

export default function TabsNavigator() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Normal" component={HomeScreen} initialParams={{ mode: 'normal' }} options={{ title: 'Recetas' }} />
      <Tabs.Screen name="Ahorro" component={HomeScreen} initialParams={{ mode: 'ahorro' }} options={{ title: 'Modo ahorro' }} />
      <Tabs.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tabs.Navigator>
  );
}