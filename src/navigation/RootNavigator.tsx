import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import BottomTabsNavigator from './BottomTabsNavigator';
import SpecificCategoryScreen from '../screens/SpecificCategoryScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  SpecificCategory: { category: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabsNavigator} />
      <Stack.Screen name="SpecificCategory" component={SpecificCategoryScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
