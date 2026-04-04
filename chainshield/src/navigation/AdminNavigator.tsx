import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { ShieldAlert, Users, Package, Link } from 'lucide-react-native';

import { AdminDashboard } from '../screens/admin/AdminDashboard';
import { ManufacturerApprovalsScreen } from '../screens/admin/ManufacturerApprovalsScreen';
import { ProductApprovalsScreen } from '../screens/admin/ProductApprovalsScreen';
import { RegisteredProductsScreen } from '../screens/admin/RegisteredProductsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={AdminDashboard} />
      <Stack.Screen name="ManufacturerApprovals" component={ManufacturerApprovalsScreen} />
      <Stack.Screen name="ProductApprovals" component={ProductApprovalsScreen} />
      <Stack.Screen name="RegisteredProducts" component={RegisteredProductsScreen} />
    </Stack.Navigator>
  );
};

export const AdminNavigator = () => {
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
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <ShieldAlert color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Registry" 
        component={RegisteredProductsScreen} 
        options={{
          tabBarLabel: 'Registry',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Link color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
