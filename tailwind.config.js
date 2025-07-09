/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        psychedelic: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          cyan: '#06B6D4',
          green: '#10B981',
          orange: '#F59E0B',
        },
        glass: {
          light: 'rgba(255,255,255,0.1)',
          medium: 'rgba(255,255,255,0.2)',
          dark: 'rgba(0,0,0,0.3)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
          to: { boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)' }
        }
      },
      backgroundImage: {
        'psychedelic-gradient': 'linear-gradient(45deg, #8B5CF6, #EC4899, #06B6D4)',
        'cosmic-gradient': 'linear-gradient(135deg, #0F0F23 0%, #1A0B2E 100%)'
      }
    }
  },
  plugins: []
}
