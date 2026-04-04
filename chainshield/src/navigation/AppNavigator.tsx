import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/appStore';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { UserNavigator } from './UserNavigator';
import { ManufacturerNavigator } from './ManufacturerNavigator';
import { AdminNavigator } from './AdminNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user } = useAppStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <>
            {user.role === 'USER' && (
              <Stack.Screen name="UserApp" component={UserNavigator} />
            )}
            {user.role === 'MANUFACTURER' && (
              <Stack.Screen name="ManufacturerApp" component={ManufacturerNavigator} />
            )}
            {user.role === 'ADMIN' && (
              <Stack.Screen name="AdminApp" component={AdminNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
