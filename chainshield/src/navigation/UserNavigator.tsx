import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { Home, ClipboardList, User as UserIcon } from 'lucide-react-native';

import { UserDashboard } from '../screens/user/UserDashboard';
import { ScannerScreen } from '../screens/user/ScannerScreen';
import { ScanResultScreen } from '../screens/user/ScanResultScreen';
import { HistoryScreen } from '../screens/user/HistoryScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// We need a stack for the Dashboard tab so we can push Scanner & ScanResult onto it without showing bottom tabs if we don't want to, but standard pushes are fine.
const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={UserDashboard} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="ScanResult" component={ScanResultScreen} />
    </Stack.Navigator>
  );
};

export const UserNavigator = () => {
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
        name="HomeTab" 
        component={DashboardStack} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <UserIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
