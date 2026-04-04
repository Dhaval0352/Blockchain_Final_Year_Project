import React from 'react';
import { View, StyleSheet, TouchableOpacityProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface CardProps extends TouchableOpacityProps {
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, variant = 'elevated', ...props }) => {
  const { colors } = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          borderWidth: 1,
          borderColor: 'transparent'
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'flat':
        return {
          backgroundColor: colors.surface,
          borderWidth: 0,
        };
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.card, getVariantStyles(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      {...props}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
  },
});
