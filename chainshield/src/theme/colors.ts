export type ThemeColors = {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
};

export const lightColors: ThemeColors = {
  background: '#FFF9FB', // Very light pastel pink
  surface: '#FFFFFF',
  primary: '#FFB7B2', // Pastel Coral/Pink
  secondary: '#E2F0CB', // Pastel Green/Mint
  text: '#2D3748', // Dark gray for contrast
  textSecondary: '#718096',
  border: '#E2E8F0',
  success: '#9AE6B4', // Soft green
  error: '#FEB2B2', // Soft red
  warning: '#FBD38D', // Soft orange
};

export const darkColors: ThemeColors = {
  background: '#1A202C', // Dark slate
  surface: '#2D3748',
  primary: '#FFB7B2',
  secondary: '#E2F0CB',
  text: '#F7FAFC',
  textSecondary: '#A0AEC0',
  border: '#4A5568',
  success: '#68D391',
  error: '#FC8181',
  warning: '#F6AD55',
};
