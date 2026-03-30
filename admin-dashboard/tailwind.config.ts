import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // ── Brand (matching AppColors) ─────────────────────────────────────
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--primary)",
        },

        // ── Semantic ───────────────────────────────────────────────────────
        success: { DEFAULT: "var(--success)", light: "var(--success-light)" },
        warning: { DEFAULT: "var(--warning)", light: "var(--warning-light)" },
        error: { DEFAULT: "var(--error)", light: "var(--error-light)" },
        info: { DEFAULT: "var(--info)", light: "var(--info-light)" },

        // ── Layout tokens ──────────────────────────────────────────────────
        background: "var(--background)",
        surface: "var(--surface)",
        card: "var(--card)",
        divider: "var(--divider)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // ── Text ──────────────────────────────────────────────────────────
        foreground: "var(--foreground)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",

        // ── shadcn-compatible aliases ──────────────────────────────────────
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },

        // ── Stock statuses ─────────────────────────────────────────────────
        "in-stock": "var(--in-stock)",
        "low-stock": "var(--low-stock)",
        "out-of-stock": "var(--out-of-stock)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        // Keep defaults too
        DEFAULT: "var(--radius-md)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
