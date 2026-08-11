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

// Design direction: "certification seal meets cosmetics counter."
// Gold reads as a stamp/seal of authenticity (and as premium packaging);
// teal is reserved *only* for verified/on-chain states, so it always
// reads as "this was actually checked," never as decoration.
// Everything else in the palette stays warm on purpose — teal is the
// one deliberately cool color, which is what makes it feel trustworthy.

export const lightColors: ThemeColors = {
  background: '#FBF7F0', // Warm ivory, not stark white
  surface: '#FFFFFF',
  primary: '#E8B84B',    // Champagne gold — brand / primary actions
  secondary: '#5FBBA6',  // Deeper teal (light-bg contrast) — verified accents
  text: '#2A2530',
  textSecondary: '#756F7D',
  border: '#EDE6DD',
  success: '#2F9D6C',
  error: '#D1584B',
  warning: '#D1893A',
};

export const darkColors: ThemeColors = {
  background: '#14171F', // Deep warm ink, not generic slate
  surface: '#1E222E',
  primary: '#E8B84B',    // Champagne gold — brand / primary actions
  secondary: '#7FD8C4',  // Clear teal — reserved for "on-chain / verified"
  text: '#F2EFEA',
  textSecondary: '#9A96A8',
  border: '#2C3040',
  success: '#5FD495',
  error: '#F0776B',
  warning: '#F0A34E',
};
