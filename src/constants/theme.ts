export const Colors = {
  light: {
    primary: '#1D1D1D',
    secondary: '#FFFFFF',
    surface: '#FFFFFF',
    tertiary: '#79747E',
    background: '#FFFFFF',
    text: '#1D1D1D',
    textSecondary: '#919191',
    border: '#E0E0E0',
    cardBackground: '#F2F2F7',
    error: '#DC3545',
    success: '#28A745',
    checkbox: {
      checked: '#1D1D1D',
      unchecked: '#808080',
    },
  },
  dark: {
    primary: '#FFFFFF',
    secondary: '#1D1D1D',
    surface: '#1C1C1E',
    tertiary: '#A1A1A6',
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    cardBackground: '#2C2C2E',
    error: '#FF453A',
    success: '#30D158',
    checkbox: {
      checked: '#FFFFFF',
      unchecked: '#636366',
    },
  },
};

export type Theme = typeof Colors.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
