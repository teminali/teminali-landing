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
        sans: ['Inter var', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        kicker: ['11px', { lineHeight: '1', letterSpacing: '0.16em' }],
        micro: ['12px', { lineHeight: '1.5' }],
        body: ['15px', { lineHeight: '1.65' }],
        lead: ['17px', { lineHeight: '1.6' }],
        h3: ['clamp(22px, 2.2vw, 28px)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h2: ['clamp(30px, 3.6vw, 46px)', { lineHeight: '1.14', letterSpacing: '-0.022em' }],
        h1: ['clamp(36px, 4.6vw, 60px)', { lineHeight: '1.1', letterSpacing: '-0.028em' }],
        display: ['clamp(48px, 7vw, 96px)', { lineHeight: '1', letterSpacing: '-0.035em' }],
      },
      maxWidth: { shell: '1440px' },
      spacing: { gutter: 'var(--gutter)' },
      borderRadius: { card: '12px', ctl: '8px' },
      transitionTimingFunction: { brand: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    },
  },
  plugins: [],
} satisfies Config
