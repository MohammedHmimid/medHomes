/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#101827',
          soft: '#1C2739',
        },
        canvas: '#F6F7F3',
        panel: '#FFFFFF',
        teal: {
          50: '#EAF3F0',
          100: '#CFE4DC',
          400: '#2D8A72',
          500: '#1F6F5C',
          600: '#175647',
          700: '#123F34',
        },
        sand: {
          100: '#F1E6D2',
          400: '#C79A4B',
          500: '#B8863B',
          600: '#93692C',
        },
        slate: {
          400: '#8B93A1',
          500: '#697084',
          600: '#4C5265',
        },
        line: '#E4E7E0',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '26px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 39, 0.04), 0 8px 24px -12px rgba(16, 24, 39, 0.12)',
        panel: '0 1px 2px rgba(16, 24, 39, 0.05), 0 20px 40px -24px rgba(16, 24, 39, 0.18)',
      },
      backgroundImage: {
        blueprint:
          'linear-gradient(rgba(16,24,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,39,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        blueprint: '28px 28px',
      },
    },
  },
  plugins: [],
}
