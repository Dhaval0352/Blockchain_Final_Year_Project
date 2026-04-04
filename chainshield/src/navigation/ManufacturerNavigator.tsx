import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { Factory, User as UserIcon, Home } from 'lucide-react-native';

import { ManufacturerDashboard } from '../screens/manufacturer/ManufacturerDashboard';
import { ProductRegistrationScreen } from '../screens/manufacturer/ProductRegistrationScreen';
import { MyProductsScreen } from '../screens/manufacturer/MyProductsScreen';
import { QRViewScreen } from '../screens/manufacturer/QRViewScreen';
import { ProfileScreen as SharedProfileScreen } from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={ManufacturerDashboard} />
      <Stack.Screen name="RegisterProduct" component={ProductRegistrationScreen} />
      <Stack.Screen name="Products" component={MyProductsScreen} />
      <Stack.Screen name="QRView" component={QRViewScreen} />
    </Stack.Navigator>
  );
};

export const ManufacturerNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardStack} 
        options={{
          tabBarLabel: 'Portal',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Factory color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={SharedProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <UserIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
