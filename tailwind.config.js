/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#F4F7F9",
        panel: {
          DEFAULT: "rgba(255, 255, 255, 0.7)",
          raised: "rgba(255, 255, 255, 0.95)",
          line: "rgba(100, 116, 139, 0.15)",
          darker: "rgba(240, 244, 248, 0.8)",
        },
        paper: {
          DEFAULT: "#FFFFFF",
          ink: "#1E293B",
        },
        brass: {
          DEFAULT: "#3B82F6", // Calm Blue
          strong: "#60A5FA",
          ink: "#FFFFFF",
          glow: "rgba(59, 130, 246, 0.4)",
        },
        citizen: {
          primary: "#14B8A6", // Calm Teal 
          secondary: "#2DD4BF",
          glow: "rgba(20, 184, 166, 0.3)",
        },
        text: {
          1: "#0F172A",
          2: "#475569",
          3: "#94A3B8",
        },
        status: {
          pass: "#10B981",
          'pass-bg': "rgba(16, 185, 129, 0.15)",
          fail: "#EF4444",
          'fail-bg': "rgba(239, 68, 68, 0.15)",
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
        'brass-glow': '0 0 30px -5px rgba(251, 191, 36, 0.5)',
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
