import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // All colours reference CSS custom properties so Storybook
        // theme switching works without re-bundling.
        primary: {
          50:  'var(--primitive-blue-50)',
          100: 'var(--primitive-blue-100)',
          200: 'var(--primitive-blue-200)',
          300: 'var(--primitive-blue-300)',
          400: 'var(--primitive-blue-400)',
          500: 'var(--primitive-blue-500)',
          600: 'var(--primitive-blue-600)',
          700: 'var(--primitive-blue-700)',
          800: 'var(--primitive-blue-800)',
          900: 'var(--primitive-blue-900)',
          950: 'var(--primitive-blue-950)',
        },
        accent: {
          400: 'var(--primitive-amber-400)',
          500: 'var(--primitive-amber-500)',
          600: 'var(--primitive-amber-600)',
          700: 'var(--primitive-amber-700)',
        },
        success: {
          500: 'var(--primitive-green-500)',
          600: 'var(--primitive-green-600)',
        },
        danger: {
          500: 'var(--primitive-red-500)',
          600: 'var(--primitive-red-600)',
          700: 'var(--primitive-red-700)',
        },
        neutral: {
          0:   'var(--primitive-zinc-0)',
          50:  'var(--primitive-zinc-50)',
          100: 'var(--primitive-zinc-100)',
          200: 'var(--primitive-zinc-200)',
          300: 'var(--primitive-zinc-300)',
          400: 'var(--primitive-zinc-400)',
          500: 'var(--primitive-zinc-500)',
          600: 'var(--primitive-zinc-600)',
          700: 'var(--primitive-zinc-700)',
          800: 'var(--primitive-zinc-800)',
          900: 'var(--primitive-zinc-900)',
          950: 'var(--primitive-zinc-950)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card:  '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.10)',
        panel: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        modal: '0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04)',
        focus: '0 0 0 3px var(--primitive-blue-200)',
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:  '12px',
        xl:  '16px',
        full: '9999px',
      },
      keyframes: {
        spin: { to: { transform: 'rotate(360deg)' } },
        pulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'spin':       'spin 1s linear infinite',
        'pulse':      'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':    'fade-in 200ms ease-out',
        'slide-up':   'slide-up 200ms ease-out',
      },
    },
  },
  plugins: [],
}

export default config
