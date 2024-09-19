/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emrald: '#012318',
        'emrald-light': '#0A3B2D',
        'emrald-dark': '#001D15',
        'emrald-darker': '#00120F',
        'emrald-darkest': '#000B09',
        'emrald-lighter': '#0E4C37',
        'emrald-lightest': '#0F5A43',
        'emrald-accent': '#00FFD8',
        'emrald-accent-light': '#00FFD8',
        'emrald-accent-dark': '#00FFD8',
        'emrald-accent-darker': '#00FFD8',
        'emrald-accent-darkest': '#00FFD8',
        'emrald-accent-lighter': '#00FFD8',
        'emrald-accent-lightest': '#00FFD8',
        'emrald-accent-contrast': '#00FFD8',
        'emrald-accent-contrast-light': '#00FFD8',
        'emrald-accent-contrast-dark': '#00FFD8',
        'emrald-accent-contrast-darker': '#00FFD8',
        'emrald-accent-contrast-darkest': '#00FFD8',
        'emrald-title': '#03985d'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
