// src/navigation/AppNavigator.tsx — SDK 54

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../types';

import LoginScreen      from '../screens/LoginScreen';
import DashboardScreen  from '../screens/DashboardScreen';
import DetailScreen     from '../screens/DetailScreen';
import NotifikasiScreen from '../screens/NotifikasiScreen';

const Stack = createStackNavigator<RootStackParamList>();

const navTheme = {
  dark: true,
  colors: {
    primary:      COLORS.brand,
    background:   COLORS.bg_primary,
    card:         COLORS.bg_secondary,
    text:         '#ffffff',
    border:       COLORS.border,
    notification: COLORS.brand,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium:  { fontFamily: 'System', fontWeight: '500' as const },
    bold:    { fontFamily: 'System', fontWeight: '700' as const },
    heavy:   { fontFamily: 'System', fontWeight: '900' as const },
  },
};

export default function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown:      false,
          animationEnabled: true,
          cardStyle:        { backgroundColor: COLORS.bg_primary },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={DashboardScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ gestureEnabled: true, presentation: 'card' }}
        />
        <Stack.Screen
          name="Notifikasi"
          component={NotifikasiScreen}
          options={{ gestureEnabled: true, presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
