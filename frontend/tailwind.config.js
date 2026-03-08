/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        honey: {
          50: '#FFF8F5',
          100: '#FFF0EC',
          200: '#FFD9CC',
          300: '#F9C784',
          400: '#F4A5B8',
          500: '#E8799A',
          600: '#D45A7E',
        },
      },
      animation: {
        'bee-pulse': 'beePulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
      },
      keyframes: {
        beePulse: {
          '0%,100%': { transform: 'scale(1) rotate(-5deg)' },
          '50%': { transform: 'scale(1.08) rotate(5deg)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-18px) rotate(2deg)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
