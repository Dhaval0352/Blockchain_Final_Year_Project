import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} style={[styles.button, { backgroundColor: colors.surface }]}>
      {mode === 'light' ? (
        <Moon size={24} color={colors.text} />
      ) : (
        <Sun size={24} color={colors.text} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
});
