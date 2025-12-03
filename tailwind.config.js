/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./api/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#00A7E1', // Ciano Vibrante
        'primary-dark': '#008dc0',
        background: '#0A1931', // Azul Marinho
        surface: '#112240',
        border: '#1E3A5F',
        ring: '#00A7E1',
      }
    },
  },
  plugins: [],
}