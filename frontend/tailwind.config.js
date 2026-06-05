/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#0a0e27',
        'navy': '#1a1f3a',
        'neon-cyan': '#00f0ff',
        'neon-blue': '#0066ff',
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 240, 255, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 102, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
