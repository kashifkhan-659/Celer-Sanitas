/** @type {import('tailwindcss').Config} */
// Tokens trace verbatim to DESIGN.md §12 (generated). Do not hand-tune values here — change the
// design brief and regenerate DESIGN.md, then mirror it into this file (Rules.md §4).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: { 50: '#EFF9F8', 100: '#D6F0EE', 200: '#AEE1DD', 300: '#7FCECA', 400: '#4FB8B3', 500: '#2C9C99', 600: '#1F827F', 700: '#196B69', 800: '#175553', 900: '#144846' },
        neutral: { 0: '#FFFFFF', 50: '#F7F8F7', 100: '#EEF1F0', 200: '#E1E6E4', 300: '#CBD3D0', 400: '#A7B2AE', 500: '#7E8A86', 600: '#5D6764', 700: '#454E4B', 800: '#2E3634', 900: '#1D2321' },
        // FlaggedItem ONLY — do not use elsewhere (Rules.md §4). Unused until the doctor view (Day 6).
        amber: { 50: '#FDF3E4', 100: '#FBE7C7', 400: '#E8A13C', 500: '#D98324', 600: '#B96A17', 700: '#8F5212' },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', '"General Sans"', 'system-ui', 'sans-serif'] },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.18em', fontWeight: '600' }],
        label: ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.55' }],
        'body-lg': ['1.125rem', { lineHeight: '1.55' }],
        subtitle: ['1.375rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        question: ['1.75rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        title: ['2.125rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        display: ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: { xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '24px', '2xl': '28px' },
      boxShadow: {
        'ambient-sm': '0 1px 2px rgba(20,40,38,0.04), 0 2px 8px rgba(20,40,38,0.04)',
        'ambient-md': '0 4px 24px -8px rgba(20,40,38,0.10), 0 2px 8px -4px rgba(20,40,38,0.06)',
        'ambient-lg': '0 24px 60px -20px rgba(20,40,38,0.16), 0 8px 24px -12px rgba(20,40,38,0.08)',
        'highlight-inset': 'inset 0 1px 0 rgba(255,255,255,0.70)',
        'glow-teal': '0 0 0 3px rgba(79,184,179,0.18), 0 0 22px rgba(44,156,153,0.22)',
      },
      transitionTimingFunction: { fluid: 'cubic-bezier(0.32,0.72,0,1)', settle: 'cubic-bezier(0.22,1,0.36,1)' },
      transitionDuration: { 320: '320ms', 420: '420ms', 560: '560ms', 800: '800ms' },
    },
  },
  plugins: [],
};
