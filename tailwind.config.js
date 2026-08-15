/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#080710',
        glassBg: 'rgba(255, 255, 255, 0.03)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        brandViolet: '#8B5CF6',
        brandPink: '#EC4899',
        brandBlue: '#3B82F6',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        neonViolet: '0 0 15px rgba(139, 92, 246, 0.5)',
        neonPink: '0 0 15px rgba(236, 72, 153, 0.5)',
      }
    },
  },
  plugins: [],
}
