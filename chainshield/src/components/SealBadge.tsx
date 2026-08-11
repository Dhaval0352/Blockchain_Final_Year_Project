import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SealBadgeProps {
  size?: number;
  color?: string;
  children: React.ReactNode;
}

/**
 * The dashed-ring "certification seal" motif introduced on the login
 * screen. Deliberately reused only for the ONE primary action on a given
 * screen (Register Product, Scan Product, etc.) so it keeps meaning
 * "this is the main thing to do here" instead of becoming decoration
 * repeated on every card.
 */
export const SealBadge: React.FC<SealBadgeProps> = ({ size = 64, color, children }) => {
  const { colors } = useTheme();
  const ringColor = color || colors.primary;
  const coreSize = size * 0.74;

  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: ringColor }]}>
      <View style={[styles.core, { width: coreSize, height: coreSize, borderRadius: coreSize / 2, backgroundColor: ringColor }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  core: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
