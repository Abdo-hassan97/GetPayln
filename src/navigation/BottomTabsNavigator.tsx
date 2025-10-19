import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MMKV } from 'react-native-mmkv';

import AllProductsScreen from '../screens/AllProductsScreen';
import AllCategoriesScreen from '../screens/AllCategoriesScreen';

export type BottomTabsParamList = {
  AllProducts: undefined;
  AllCategories: undefined;
};

const storage = new MMKV();
const Tab = createBottomTabNavigator<BottomTabsParamList>();

const BottomTabsNavigator = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    try {
      // Clear session data but KEEP biometric info
      storage.delete('userToken'); 
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 15 }} onPress={handleLogout}>
            <Image
              source={require('../assets/images/logout.png')}
              style={{ width: 22, height: 22, tintColor: 'black' }}
            />
          </TouchableOpacity>
        ),
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="AllProducts"
        component={AllProductsScreen}
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/images/products.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#007AFF' : '#999',
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AllCategories"
        component={AllCategoriesScreen}
        options={{
          title: 'Categories',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/images/categories.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#007AFF' : '#999',
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabsNavigator;
