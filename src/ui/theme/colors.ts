/**
 * Minimalist Black & White Design System
 * Clean, high-contrast, distraction-free monochrome aesthetic with subtle functional accents.
 */

export const colors = {
  background: '#000000',            // True Deep Black
  surface: '#111111',               // Clean Matte Dark Surface
  surfaceElevated: '#191919',       // Slightly Elevated Card
  surfaceBorder: '#282828',         // Crisp Minimalist Border
  surfaceBorderLight: '#383838',    // Focused / Active Border

  primary: '#FFFFFF',               // High-Contrast Pure White
  primaryLight: '#F5F5F5',
  primaryDark: '#D4D4D4',
  primaryGlow: 'rgba(255, 255, 255, 0.08)',

  secondary: '#E5E5E5',             // Clean Off-White
  secondaryLight: '#A3A3A3',        // Neutral Gray

  accent: '#FFFFFF',                // Clean White Accents
  accentLight: '#E5E5E5',
  accentGlow: 'rgba(255, 255, 255, 0.06)',

  // Restrained Functional Colors (Only for critical financial signals)
  positive: '#22C55E',              // Subtle Green (Profit / Inflow)
  positiveLight: '#4ADE80',
  positiveGlow: 'rgba(34, 197, 94, 0.12)',

  danger: '#EF4444',                // Subtle Red (Debt / Outflow / Scams)
  dangerLight: '#F87171',
  dangerGlow: 'rgba(239, 68, 68, 0.12)',

  text: '#FFFFFF',                  // Crisp White
  textSecondary: '#A3A3A3',         // Muted Silver / Slate
  textMuted: '#666666',            // Subtle Charcoal Gray

  chartBaseline: '#666666',         // Muted Gray Curve (Current Path)
  chartWhatIf: '#FFFFFF',           // Crisp White Curve (Boosted Path)
  chartDebt: '#EF4444',

  tabBar: '#0A0A0A',
  tabBarBorder: '#1F1F1F',
};
