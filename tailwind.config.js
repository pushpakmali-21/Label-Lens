/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B1520",
        panel: {
          DEFAULT: "#121F2E",
          raised: "#17293B",
          line: "#26394B",
          darker: "#0E1A26",
        },
        paper: {
          DEFAULT: "#ECE7D9",
          ink: "#1C1A12",
        },
        brass: {
          DEFAULT: "#C9A15A",
          strong: "#E0BE7E",
          ink: "#241B08",
        },
        text: {
          1: "#EDEAE1",
          2: "#99AAB8",
          3: "#63768A",
        },
        status: {
          pass: "#5AAE83",
          'pass-bg': "rgba(90, 174, 131, 0.14)",
          fail: "#D06A5A",
          'fail-bg': "rgba(208, 106, 90, 0.16)",
          review: "#DA9E4E",
          'review-bg': "rgba(218, 158, 78, 0.16)",
        }
      },
      fontFamily: {
        serif: ["'IBM Plex Serif'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'IBM Plex Mono'", "'SFMono-Regular'", "Menlo", "monospace"],
      }
    },
  },
  plugins: [],
}
