import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import { colors } from '../theme/colors';

export type TabsParamList = {
  Inicio: undefined;
  Buscar: undefined;
  Recetas: undefined;
  Perfil: undefined;
};

const Tabs = createBottomTabNavigator<TabsParamList>();

export default function TabsNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 4 + insets.bottom, 
          paddingTop: 4,
          height: 60 + insets.bottom,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      
      <Tabs.Screen 
        name="Buscar" 
        component={SearchScreen} 
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }} 
      />
      
      <Tabs.Screen 
        name="Recetas" 
        component={RecipesScreen} 
        options={{
          title: 'Recetas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }} 
      />
      
      <Tabs.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }} 
      />
    </Tabs.Navigator>
  );
}