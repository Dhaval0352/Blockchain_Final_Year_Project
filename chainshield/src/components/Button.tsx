import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', loading, disabled, style, textStyle, icon
}) => {
  const { colors } = useTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary': return { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1 };
      case 'secondary': return { backgroundColor: colors.secondary, borderColor: colors.secondary, borderWidth: 1 };
      case 'outline': return { backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 1 };
      case 'ghost': return { backgroundColor: 'transparent' };
    }
  };

  const getTextColor = (): TextStyle => {
    switch (variant) {
      case 'primary': return { color: '#000' }; // Dark text on pastel pink
      case 'secondary': return { color: '#000' };
      case 'outline': return { color: colors.primary };
      case 'ghost': return { color: colors.text };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        (disabled || loading) && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor().color as string} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, getTextColor(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  }
});
