/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#030712",
        panel: {
          DEFAULT: "rgba(15, 23, 42, 0.4)",
          raised: "rgba(30, 41, 59, 0.5)",
          line: "rgba(255, 255, 255, 0.08)",
          darker: "rgba(2, 6, 23, 0.7)",
        },
        paper: {
          DEFAULT: "#F1F5F9",
          ink: "#0F172A",
        },
        brass: {
          DEFAULT: "#38BDF8", // Cyan-blue for Official
          strong: "#7DD3FC",
          ink: "#082F49",
          glow: "rgba(56, 189, 248, 0.4)",
        },
        citizen: {
          primary: "#F472B6", // Pink/Purple vibe for citizens
          secondary: "#C084FC",
          glow: "rgba(244, 114, 182, 0.3)",
        },
        text: {
          1: "#F8FAFC",
          2: "#94A3B8",
          3: "#475569",
        },
        status: {
          pass: "#10B981",
          'pass-bg': "rgba(16, 185, 129, 0.15)",
          fail: "#F43F5E",
          'fail-bg': "rgba(244, 63, 94, 0.15)",
          review: "#F59E0B",
          'review-bg': "rgba(245, 158, 11, 0.15)",
        }
      },
      fontFamily: {
        serif: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Outfit'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        'brass-glow': '0 0 30px -5px rgba(56, 189, 248, 0.5)',
        'pass-glow': '0 0 30px -5px rgba(16, 185, 129, 0.5)',
        'fail-glow': '0 0 30px -5px rgba(244, 63, 94, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'glass': '16px',
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
