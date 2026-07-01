import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bss: {
          black:   '#000000',
          surface: '#0c0c0c',
          card:    '#141414',
          border:  '#222222',
          muted:   '#555555',
          subtle:  '#888888',
          white:   '#ffffff',
          offwhite:'#e8e8e8',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem',  { lineHeight: '1' }],
        xs:    ['0.75rem',  { lineHeight: '1.4' }],
        sm:    ['0.875rem', { lineHeight: '1.5' }],
        base:  ['1rem',     { lineHeight: '1.6' }],
        lg:    ['1.125rem', { lineHeight: '1.6' }],
        xl:    ['1.25rem',  { lineHeight: '1.5' }],
        '2xl': ['1.5rem',   { lineHeight: '1.4' }],
        '3xl': ['2rem',     { lineHeight: '1.25' }],
        '4xl': ['2.75rem',  { lineHeight: '1.15' }],
        '5xl': ['3.75rem',  { lineHeight: '1.1' }],
        '6xl': ['5rem',     { lineHeight: '1.05' }],
        '7xl': ['6.5rem',   { lineHeight: '1.05' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.03em',
        tight:    '-0.02em',
        normal:   '0em',
        wide:     '0.05em',
        wider:    '0.1em',
        widest:   '0.2em',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '36': '9rem',
        '42': '10.5rem',
        '100': '25rem',
        '128': '32rem',
      },
      maxWidth: {
        site: '1400px',
        prose: '680px',
        narrow: '480px',
      },
      animation: {
        'fade-up':  'fadeUp 0.6s ease forwards',
        'fade-in':  'fadeIn 0.5s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
  '0%':   { transform: 'translateX(0)' },
  '100%': { transform: 'translateX(-50%)' },
},
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config