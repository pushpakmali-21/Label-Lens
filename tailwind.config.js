/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F5F0",
        charcoal: "#20252B",
        slate: "#59636E",
        ink: "#F7F5F0",
        panel: {
          DEFAULT: "#FFFFFF",
          raised: "#F8F7F3",
          line: "#D8D7D2",
          darker: "#F0EEE9",
          charcoal: "#20252B",
        },
        paper: {
          DEFAULT: "#FFFFFF",
          ink: "#20252B",
        },
        brass: {
          DEFAULT: "#183D35", // Precision Deep Green
          strong: "#0F2A23",
          ink: "#FFFFFF",
          glow: "rgba(24, 61, 53, 0.25)",
        },
        citizen: {
          primary: "#183D35",
          secondary: "#234F45",
          glow: "rgba(24, 61, 53, 0.2)",
        },
        text: {
          1: "#20252B", // Charcoal Slate
          2: "#59636E", // Muted Slate
          3: "#8C96A0", // Light Slate
        },
        status: {
          pass: "#166534",
          'pass-bg': "#F0FDF4",
          fail: "#C9572C",
          'fail-bg': "#FFF7ED",
          review: "#92400E",
          'review-bg': "#FFFBEB",
        },
        amber: "#C9572C",
        vermilion: "#C9572C",
        sage: "#DCE5DD",
        sageDark: "#B3C5B5",
      },
      fontFamily: {
        brand: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        serif: ["'Instrument Serif'", "'IBM Plex Serif'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        display: ["'Instrument Serif'", "'IBM Plex Serif'", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "'Courier New'", "monospace"],
      },
      boxShadow: {
        'brass-glow': '0 4px 14px -1px rgba(24, 61, 53, 0.3)',
        'pass-glow': '0 4px 14px -1px rgba(22, 101, 52, 0.25)',
        'fail-glow': '0 4px 14px -1px rgba(201, 87, 44, 0.25)',
        'glass': '0 4px 20px -2px rgba(32, 37, 43, 0.06), 0 2px 6px -1px rgba(32, 37, 43, 0.04)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulseGlow': 'pulseGlow 3s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slideUp': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 5s ease-in-out infinite',
        'scanSweep': 'scanSweep 2.5s ease-in-out infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(15px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(25px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanSweep: {
          '0%': { top: '-25%', opacity: '0.8' },
          '50%': { opacity: '1' },
          '100%': { top: '105%', opacity: '0.8' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
