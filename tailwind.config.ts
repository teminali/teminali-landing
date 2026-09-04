import type { Config } from 'tailwindcss'

/**
 * Every colour here is a var() into tokens.css, which is a straight copy of the
 * app's token sheet. Nothing in this file introduces a hex; if a value is
 * missing, add it to tokens.css and point at it from here.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: 'var(--ground)',
        rail: 'var(--rail)',
        surface: {
          DEFAULT: 'var(--surface)',
          sunken: 'var(--surface-sunken)',
          raised: 'var(--surface-raised)',
          control: 'var(--surface-control)',
        },
        line: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        ink: {
          bright: 'var(--text-bright)',
          DEFAULT: 'var(--text)',
          body: 'var(--text-body)',
          dim: 'var(--text-dim)',
          muted: 'var(--text-muted)',
          soft: 'var(--text-soft)',
          faint: 'var(--text-faint)',
          ghost: 'var(--text-ghost)',
        },
        mark: 'var(--mark)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          dim: 'var(--accent-dim)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Sora", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      /**
       * Ported 1:1 from the reference's type scale: fixed px, no fluid clamp,
       * headings never shrink at breakpoints. Weight is 400 throughout except
       * `display` (their h1) at 500; letter-spacing is a flat -0.005em on the
       * three heading steps that carry it and nothing is tighter.
       */
      fontSize: {
        kicker: ['12px', { lineHeight: '1', letterSpacing: '0.16em' }],
        micro: ['12px', { lineHeight: '1.5' }],
        small: ['14px', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.5' }],
        lead: ['1.125rem', { lineHeight: '1.5' }],
        large: ['1.25rem', { lineHeight: '1.5' }],
        h5: ['1.5rem', { lineHeight: '1.5', fontWeight: '400' }],
        h4: ['2rem', { lineHeight: '1.3', fontWeight: '400' }],
        h3: ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.005em', fontWeight: '400' }],
        h2: ['3rem', { lineHeight: '1.25', letterSpacing: '-0.005em', fontWeight: '400' }],
        h1: ['5.9rem', { lineHeight: '1', letterSpacing: '-0.005em', fontWeight: '500' }],
        display: ['5.9rem', { lineHeight: '1', letterSpacing: '-0.005em', fontWeight: '500' }],
      },
      maxWidth: { shell: '1440px', 'shell-md': '1344px', 'shell-sm': '768px' },
      spacing: { gutter: 'var(--gutter)' },
      borderRadius: { card: '12px', ctl: '8px' },
      transitionTimingFunction: { brand: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    },
  },
  plugins: [],
} satisfies Config
