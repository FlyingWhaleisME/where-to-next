/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override rose with user's coral/salmon palette (based on #EF7F7F, #F1ABA5)
        rose: {
          50: '#FEF5F4',
          100: '#FDEAE8',
          200: '#F1ABA5',
          300: '#F09590',
          400: '#EF7F7F',
          500: '#E45A5A',
          600: '#D04040',
          700: '#B33030',
          800: '#922525',
          900: '#711D1D',
        },
        // User's custom green hex codes (complement to emerald)
        hawaii: {
          mint: '#D5F9D6',
          light: '#B2F4B3',
          green: '#90EF91',
          peach: '#F1ABA5',
          coral: '#EF7F7F',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
