import type { DesignTokens } from '../designTokens';

export type ThemeContract = {
  name: 'modern' | 'game';
  tokens: DesignTokens;
  cssVars: Record<string, string>;
};

export const modernTheme: ThemeContract = {
  name: 'modern',
  tokens: {
    color: {
      ink: '#142018',
      muted: '#4a5c4e',
      surface: '#fffdf7',
      field: '#f6f3ea',
      line: 'rgba(20, 32, 24, 0.14)',
      softLine: 'rgba(255, 255, 255, 0.34)',
      role: '#1f7a4d',
      danger: '#b4373e',
      warning: '#a76720',
      success: '#2f8f5b',
      shadow: '0 18px 50px rgba(20, 32, 24, 0.16)',
    },
    radius: { sm: 6, md: 8, lg: 12, full: 9999 },
    space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
    type: {
      xs: 11,
      sm: 12,
      base: 13,
      md: 14,
      lg: 18,
      xl: 28,
      xxl: 54,
      weight: { normal: 400, bold: 800, black: 900 },
      lineHeight: { display: 1.0, heading: 1.12, body: 1.5, caption: 1.4 },
    },
    touch: { min: 44, comfortable: 48, large: 58 },
  },
  cssVars: {
    '--ink': '#142018',
    '--muted': '#4a5c4e',
    '--surface': '#fffdf7',
    '--field': '#f6f3ea',
    '--line': 'rgba(20, 32, 24, 0.14)',
    '--soft-line': 'rgba(255, 255, 255, 0.34)',
    '--danger': '#b4373e',
    '--warning': '#a76720',
    '--success': '#2f8f5b',
    '--shadow': '0 18px 50px rgba(20, 32, 24, 0.16)',
  },
};

export const gameTheme: ThemeContract = {
  name: 'game',
  tokens: {
    color: {
      ink: '#142018',
      muted: '#4a5c4e',
      surface: '#fff3c9',
      field: '#f3e6c2',
      line: 'rgba(16, 32, 23, 0.2)',
      softLine: 'rgba(255, 243, 201, 0.36)',
      role: '#1f7a4d',
      danger: '#b4373e',
      warning: '#a76720',
      success: '#2f8f5b',
      shadow: '0 10px 0 rgba(16, 32, 23, 0.12), 0 24px 56px rgba(0, 0, 0, 0.22)',
    },
    radius: { sm: 6, md: 8, lg: 12, full: 9999 },
    space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
    type: {
      xs: 11,
      sm: 12,
      base: 13,
      md: 14,
      lg: 18,
      xl: 28,
      xxl: 54,
      weight: { normal: 400, bold: 900, black: 900 },
      lineHeight: { display: 1.0, heading: 1.12, body: 1.5, caption: 1.4 },
    },
    touch: { min: 44, comfortable: 48, large: 58 },
  },
  cssVars: {
    '--ink': '#142018',
    '--muted': '#4a5c4e',
    '--surface': '#fff3c9',
    '--field': '#f3e6c2',
    '--line': 'rgba(16, 32, 23, 0.2)',
    '--soft-line': 'rgba(255, 243, 201, 0.36)',
    '--danger': '#b4373e',
    '--warning': '#a76720',
    '--success': '#2f8f5b',
    '--shadow': '0 10px 0 rgba(16, 32, 23, 0.12), 0 24px 56px rgba(0, 0, 0, 0.22)',
    '--game-dark': '#101713',
    '--game-soil': '#35261c',
    '--game-soil-2': '#5b4028',
    '--game-leaf': '#6eca74',
    '--game-cream': '#fff3c9',
    '--game-gold': '#f4bd42',
    '--game-outline': '#102017',
  },
};

export const themes: Record<'modern' | 'game', ThemeContract> = {
  modern: modernTheme,
  game: gameTheme,
};
