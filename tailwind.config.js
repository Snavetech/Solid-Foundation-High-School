/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        school: {
          navy: '#0f172a',
          blue: '#1e3a8a',
          indigo: '#3730a3',
          emerald: '#059669',
          gold: '#d97706',
          amber: '#b45309',
        }
      }
    },
  },
  plugins: [],
}
