/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-blue': '#00fff9',
        'cyber-purple': '#bd00ff',
        'cyber-pink': '#ff00f7',
        'cyber-green': '#00ff9f',
        'terminal-black': '#0a0a0f',
        'terminal-green': '#3fff3f',
      },
      animation: {
        'terminal-blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.3s ease-in forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 60s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { 'box-shadow': '0 0 5px rgb(0 255 249 / 0.5), 0 0 10px rgb(0 255 249 / 0.3)' },
          '100%': { 'box-shadow': '0 0 20px rgb(0 255 249 / 0.5), 0 0 30px rgb(0 255 249 / 0.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            'box-shadow': '0 0 20px rgb(0 255 249 / 0.5), 0 0 30px rgb(0 255 249 / 0.3)',
          },
          '50%': {
            opacity: '0.5',
            'box-shadow': '0 0 10px rgb(0 255 249 / 0.3), 0 0 20px rgb(0 255 249 / 0.2)',
          },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-25%)' },
        },
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(to right, rgb(0 255 249 / 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgb(0 255 249 / 0.1) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'cyber-grid': '40px 40px',
      },
    },
  },
  plugins: [],
} 