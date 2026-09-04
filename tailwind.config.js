/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0E17",
        panel: {
          DEFAULT: "#111625",
          raised: "#182032",
          line: "#232D45",
          darker: "#0A0D15",
        },
        purple: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
          950: "#3B0764",
          accent: "#8B5CF6",
          vibrant: "#7C3AED",
        },
        green: {
          compliant: "#10B981",
          'compliant-bg': "rgba(16, 185, 129, 0.12)",
        },
        paper: {
          DEFAULT: "#F5F3EF",
          ink: "#1C1A12",
        },
        text: {
          1: "#F8FAFC",
          2: "#94A3B8",
          3: "#64748B",
        },
        status: {
          pass: "#10B981",
          'pass-bg': "rgba(16, 185, 129, 0.14)",
          fail: "#EF4444",
          'fail-bg': "rgba(239, 68, 68, 0.16)",
          review: "#F59E0B",
          'review-bg': "rgba(245, 158, 11, 0.16)",
        }
      },
      fontFamily: {
        serif: ["'IBM Plex Serif'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'IBM Plex Mono'", "'SFMono-Regular'", "Menlo", "monospace"],
      },
      boxShadow: {
        'purple-glow': '0 0 25px -5px rgba(124, 58, 237, 0.45)',
        'green-glow': '0 0 25px -5px rgba(16, 185, 129, 0.40)',
      }
    },
  },
  plugins: [],
}
