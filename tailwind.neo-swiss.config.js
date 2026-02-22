/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // Neo-Swiss Color Palette
      colors: {
        'swiss-black': '#000000',
        'swiss-white': '#FFFFFF',
        'swiss-orange': '#FF4500',
        'swiss-inactive': 'rgba(0, 0, 0, 0.4)',
      },

      // Typography - Distinctive font families
      fontFamily: {
        // Display/Headings - Bold Grotesque Sans
        // Replace these with your chosen fonts (e.g., 'Suisse Intl', 'Aktiv Grotesk', 'GT America')
        'display': ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Body - Regular Grotesque Sans
        'body': ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Technical/Labels - Monospace
        'mono': ['var(--font-mono)', 'ui-monospace', 'Courier New', 'monospace'],
      },

      // Type Scale (aligned to 8px grid)
      fontSize: {
        'xs': ['10px', { lineHeight: '16px', letterSpacing: '0.05em' }],  // Labels
        'sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em' }],  // Labels
        'base': ['14px', { lineHeight: '24px' }],                         // Body
        'lg': ['16px', { lineHeight: '24px' }],                           // Body Large
        'xl': ['20px', { lineHeight: '24px' }],                           // Subheading
        '2xl': ['24px', { lineHeight: '32px' }],                          // Subheading
        '3xl': ['32px', { lineHeight: '40px' }],                          // Header
        '4xl': ['40px', { lineHeight: '48px' }],                          // Display
        '5xl': ['48px', { lineHeight: '56px' }],                          // Display Large
      },

      // Line Heights - Architectural
      lineHeight: {
        'architectural': '1.1',   // Headers
        'body': '1.5',            // Body text
      },

      // Letter Spacing
      letterSpacing: {
        'caps': '0.05em',         // All-caps labels
      },

      // 8px Baseline Grid Spacing
      spacing: {
        '0': '0px',
        '1': '8px',      // Base unit
        '2': '16px',     // Small gap
        '3': '24px',     // Button padding horizontal
        '4': '32px',     // Medium gap
        '5': '40px',
        '6': '48px',
        '8': '64px',     // Large/Sectional gap
        '12': '96px',
        '16': '128px',
        '20': '160px',
        '24': '192px',
      },

      // Border Radius - Minimal (0-4px)
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        'DEFAULT': '4px',
        // No larger radius values in Neo-Swiss
      },

      // Border Width
      borderWidth: {
        'DEFAULT': '1px',
        '0': '0px',
        '2': '2px',      // Active states
      },

      // Opacity
      opacity: {
        '0': '0',
        '40': '0.4',     // Inactive elements
        '100': '1',
      },

      // Box Shadow - NONE (flat hierarchy)
      boxShadow: {
        'none': 'none',
        // No other shadow values
      },

      // Animation Delays (for staggered reveals)
      transitionDelay: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },

      // Animation Durations
      transitionDuration: {
        '0': '0ms',       // Instant (hover effects)
        '150': '150ms',   // Quick
        '300': '300ms',   // Standard
        '500': '500ms',   // Deliberate
      },

      // Focus Ring
      ringWidth: {
        'DEFAULT': '2px',
      },

      ringColor: {
        'DEFAULT': '#FF4500', // Signal Orange
      },

      ringOffsetWidth: {
        '0': '0px',
        '2': '2px',
      },
    },
  },

  plugins: [
    // Custom utilities for Neo-Swiss patterns
    function({ addUtilities }) {
      const newUtilities = {
        // Text utilities
        '.text-caps': {
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
        },

        // Button base styles
        '.btn-primary': {
          'background-color': '#000000',
          'color': '#FFFFFF',
          'padding': '12px 24px',
          'border-radius': '0px',
          'font-weight': '700',
          'border': 'none',
          'box-shadow': 'none',
        },

        '.btn-primary-orange': {
          'background-color': '#FF4500',
          'color': '#FFFFFF',
          'padding': '12px 24px',
          'border-radius': '0px',
          'font-weight': '700',
          'border': 'none',
          'box-shadow': 'none',
        },

        '.btn-secondary': {
          'background-color': 'transparent',
          'color': '#000000',
          'padding': '12px 24px',
          'border': '1px solid #000000',
          'border-radius': '0px',
          'font-weight': '700',
          'box-shadow': 'none',
        },

        '.btn-tertiary': {
          'background-color': 'transparent',
          'color': '#000000',
          'border': 'none',
          'padding': '12px 0',
          'font-family': 'var(--font-mono)',
          'text-transform': 'uppercase',
          'font-size': '12px',
          'letter-spacing': '0.05em',
          '&::before': {
            content: '">"',
            'margin-right': '8px',
          },
        },

        // Input invisible field
        '.input-invisible': {
          'background': 'transparent',
          'border': 'none',
          'border-bottom': '1px solid #000000',
          'border-radius': '0px',
          'padding': '8px 0',
          'outline': 'none',
          '&:focus': {
            'border-bottom-color': '#FF4500',
            'border-bottom-width': '2px',
          },
        },

        // Mechanical toggle
        '.toggle-mechanical': {
          'display': 'inline-flex',
          'border': '1px solid #000000',
          'border-radius': '0px',
          'overflow': 'hidden',
        },

        '.toggle-option': {
          'padding': '8px 16px',
          'background': 'transparent',
          'border': 'none',
          'cursor': 'pointer',
          'font-family': 'var(--font-mono)',
          'font-size': '12px',
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
        },

        '.toggle-option-active': {
          'background': '#000000',
          'color': '#FFFFFF',
        },

        // Grid overlay (for backgrounds)
        '.bg-swiss-grid': {
          'background-image': 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
          'background-size': '8px 8px',
        },

        // Noise texture
        '.bg-swiss-noise': {
          'background-image': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        },
      }

      addUtilities(newUtilities)
    },
  ],
}
