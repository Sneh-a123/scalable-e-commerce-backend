/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-navy': '#10101B',
        'electric-purple': '#8B5CF6',
        'neon-lime': '#D9FF57',
        'dark-slate': '#242235',
        'slate-card': '#1B1A2A',
        'lavender-grey': '#B9B8C9',
        'mint-green': '#34D399',
        'coral-red': '#FB7185'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-lime': '0 0 25px -5px rgba(217, 255, 87, 0.35)',
        'card-subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
      },
      borderRadius: {
        'card': '18px'
      }
    }
  },
  plugins: []
};
