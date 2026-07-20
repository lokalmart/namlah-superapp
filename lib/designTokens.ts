export type ThemeName = 'modern' | 'game';

export type DesignTokens = {
  color: {
    ink: string;
    muted: string;
    surface: string;
    field: string;
    line: string;
    softLine: string;
    role: string;
    danger: string;
    warning: string;
    success: string;
    shadow: string;
  };
  radius: { sm: number; md: number; lg: number; full: number };
  space: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  type: {
    xs: number;
    sm: number;
    base: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    weight: { normal: number; bold: number; black: number };
    lineHeight: { display: number; heading: number; body: number; caption: number };
  };
  touch: { min: number; comfortable: number; large: number };
};

export const tokens: DesignTokens = {
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
};

export const typographyScale = {
  display: { size: tokens.type.xxl, weight: tokens.type.weight.black, lineHeight: tokens.type.lineHeight.display },
  h1: { size: tokens.type.xl, weight: tokens.type.weight.bold, lineHeight: tokens.type.lineHeight.heading },
  h2: { size: tokens.type.lg, weight: tokens.type.weight.bold, lineHeight: tokens.type.lineHeight.heading },
  body: { size: tokens.type.md, weight: tokens.type.weight.normal, lineHeight: tokens.type.lineHeight.body },
  caption: { size: tokens.type.sm, weight: tokens.type.weight.bold, lineHeight: tokens.type.lineHeight.caption },
} as const;
