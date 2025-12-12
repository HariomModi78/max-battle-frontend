/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Blue Theme
        primary: {
          50: '#eff6ff',   // Very light blue
          100: '#dbeafe',  // Light blue
          200: '#bfdbfe',  // Lighter blue
          300: '#93c5fd',  // Light medium blue
          400: '#60a5fa',  // Medium light blue
          500: '#3b82f6',  // Main blue (Max Battle blue)
          600: '#2563eb',  // Darker blue
          700: '#1d4ed8',  // Dark blue
          800: '#1e40af',  // Very dark blue
          900: '#1e3a8a',  // Darkest blue
        },
        // Secondary colors
        secondary: {
          50: '#f8fafc',   // Very light gray
          100: '#f1f5f9',  // Light gray
          200: '#e2e8f0',  // Medium light gray
          300: '#cbd5e1',  // Light medium gray
          400: '#94a3b8',  // Medium gray
          500: '#64748b',  // Main gray
          600: '#475569',  // Dark gray
          700: '#334155',  // Darker gray
          800: '#1e293b',  // Very dark gray
          900: '#0f172a',  // Almost black
        },
        // Accent colors
        accent: {
          green: '#10b981',   // Success green
          red: '#ef4444',     // Error red
          yellow: '#f59e0b',  // Warning yellow
          purple: '#8b5cf6',  // Accent purple
        },
        // Theme colors
        theme: {
          primary: '#2e63f2',    // Max Battle blue
          secondary: '#1a1a1a',  // Dark gray/black
          accent: '#ffffff',     // White
          surface: '#ffffff',    // White surface
          background: '#f8fafc', // Light background
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      width: {
        '30': '30rem',
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1024px',
      },
      maxWidth: {
        '30': '30rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
