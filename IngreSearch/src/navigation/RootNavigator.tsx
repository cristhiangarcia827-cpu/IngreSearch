
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabsNavigator from './TabsNavigator';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';

export type RootStackParamList = {
  Tabs: undefined;
  RecipeDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Detalle de receta' }} />
    </Stack.Navigator>
  );
}