/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage:{
        'gradient':'linear-gradient(107deg, #02274A 1.11%, #000 100%)',
        'gradient-2': 'linear-gradient(94deg, #4169E1 -11.7%, #02274A 114.36%)',
      },
      rotate:{
        '360':'360deg'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}