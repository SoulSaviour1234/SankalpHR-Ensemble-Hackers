/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hrms: {
          sidebar: '#FFFFFF',
          bg: '#F8FAFC',
          lime: '#D9F99D',
          purple: '#E9D5FF',
          green: '#DCFCE7',
          orange: '#FFEDD5',
          blue: '#DBEAFE',
          text: {
            primary: '#1E293B',
            secondary: '#64748B',
          }
        }
      }
    },
  },
  plugins: [],
}
