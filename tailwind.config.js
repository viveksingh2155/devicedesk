/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#D9D28B',
          light: '#F4F2DB',
          dark: '#C4BC6C'
        },
        sage: {
          DEFAULT: '#B2BD7E',
          light: '#E6EBCB',
          dark: '#9AA665'
        },
        olive: {
          DEFAULT: '#8E9162',
          light: '#CED0B8',
          dark: '#6E7146'
        },
        forest: {
          DEFAULT: '#6A795D',
          light: '#8E9E80',
          dark: '#4C5841'
        },
        desk: {
          bg: '#F7F7F1',
          card: '#FFFEF9',
          primary: '#25291F',
          secondary: '#777B68',
          border: '#E9E7D9',
          muted: '#F0EFE6'
        },
        priority: {
          critical: '#C93B2B',
          high: '#D97706',
          medium: '#CA8A04',
          low: '#6A795D'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(37, 41, 31, 0.04), 0 1px 3px rgba(37, 41, 31, 0.02)',
        'medium': '0 4px 20px rgba(37, 41, 31, 0.07), 0 2px 6px rgba(37, 41, 31, 0.04)',
        'elevated': '0 10px 30px rgba(37, 41, 31, 0.09), 0 4px 10px rgba(37, 41, 31, 0.04)',
      }
    },
  },
  plugins: [],
}
