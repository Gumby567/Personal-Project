/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"','Georgia','serif'],
        body:    ['"Inter"','system-ui','sans-serif'],
      },
      colors: {
        amber: {
          950: '#431407',
        }
      },
      animation: {
        'fade-in':  'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(14px)' },
                   to:   { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
