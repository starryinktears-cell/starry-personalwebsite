/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4f1ea',
        paper2: '#ece8df',
        ink: '#1c1d1a',
        inkMuted: '#5e5f58',
        olive: 'rgb(var(--olive-rgb, 98 106 76) / <alpha-value>)',
        oliveDark: 'rgb(var(--olive-deep-rgb, 58 63 45) / <alpha-value>)',
        footer: 'rgb(var(--footer-rgb, 58 63 45) / <alpha-value>)',
        footerInk: 'rgb(var(--footer-ink-rgb, 255 255 255) / <alpha-value>)',
        ember: '#c8743a',
        night: '#0e0f0d',
        mist: '#ece8df',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { display: '0.08em' },
      boxShadow: { panel: '0 8px 30px rgba(34, 36, 31, 0.06)' },
    },
  },
  plugins: [],
}
