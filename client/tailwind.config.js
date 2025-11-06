/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#01AA85",
        secondary: "#1e293b",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        info: "#3b82f6",
        'auction-live': '#dc2626',
        'auction-upcoming': '#3b82f6',
        'auction-ended': '#6b7280',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'countdown': '0 -4px 20px rgba(0, 0, 0, 0.1)',
        'testimonial': '0 10px 40px rgba(1, 170, 133, 0.1)',
      },
      borderRadius: {
        'card': '16px',
        'badge': '24px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      fontSize: {
        'countdown': '2rem',
        'countdown-label': '0.65rem',
      },
      fontWeight: {
        'black': '900',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideInLeft: 'slideInLeft 0.5s ease-out',
        slideInRight: 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  }, 
  plugins: [],
};
