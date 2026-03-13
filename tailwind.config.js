/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nyx: {
          black: '#000000',
          violet: '#6B21FF',
          violetLight: '#8B3FFF',
          violetDim: 'rgba(107,33,255,0.15)',
          cyan: '#00FFD1',
          cyanDim: 'rgba(0,255,209,0.12)',
          glass: 'rgba(255,255,255,0.04)',
          glassBorder: 'rgba(255,255,255,0.08)',
          surface: 'rgba(15,10,30,0.95)',
          muted: '#5a5a72',
          text: '#e0e0f0',
          subtext: '#8888a8',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        'violet-glow': '0 0 24px rgba(107,33,255,0.6), 0 0 60px rgba(107,33,255,0.2)',
        'violet-glow-sm': '0 0 12px rgba(107,33,255,0.5)',
        'cyan-glow': '0 0 16px rgba(0,255,209,0.5)',
        'glass': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'pulse-violet': 'pulse-violet 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-violet': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(107,33,255,0.8), 0 0 40px rgba(107,33,255,0.3)' },
          '50%': { boxShadow: '0 0 32px rgba(107,33,255,1), 0 0 80px rgba(107,33,255,0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'typing': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
