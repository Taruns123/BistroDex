/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"DM Sans Variable"', 'sans-serif']
      },
      colors: {
        // warm neutrals
        ink: { DEFAULT: '#2A1E16', 2: '#65544A', 3: '#9A887A' },
        cream: '#F5EFE6',
        paper: '#FFFDF9',
        sand: { DEFAULT: '#EFE6D9', 2: '#E6DACA' },
        line: '#E7DCCD',
        espresso: { DEFAULT: '#221813', 2: '#2E221B', 3: '#3D2F26' },
        // appetizing accent
        chili: {
          50: '#FFF3ED',
          100: '#FFE1D2',
          200: '#FDC2A6',
          400: '#F07A4A',
          500: '#E5592A',
          600: '#C9431A',
          700: '#A33512'
        },
        saffron: { 50: '#FFF7E6', 100: '#FDEBC4', 500: '#E59A1F', 700: '#9A6206' },
        herb: { 50: '#EDF6EF', 100: '#D3EAD8', 500: '#2F8A4D', 700: '#1F6436' },
        slateblue: { 50: '#EEF3F9', 100: '#D9E5F2', 500: '#1F6FA8', 700: '#17537E' },
        // payment-mix series (validated: dataviz validate_palette, light surface)
        pay: { upi: '#C2410C', card: '#1F6FA8', cash: '#B7860B' }
      },
      boxShadow: {
        card: '0 1px 0 rgba(42,30,22,0.04), 0 1px 3px rgba(42,30,22,0.06)',
        lift: '0 10px 30px -12px rgba(42,30,22,0.28)',
        pay: '0 10px 24px -8px rgba(201,67,26,0.55)'
      },
      borderRadius: { xl2: '1.125rem' }
    }
  },
  plugins: []
}
