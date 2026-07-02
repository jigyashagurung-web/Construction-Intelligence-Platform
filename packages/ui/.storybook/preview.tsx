import React from 'react'
import type { Preview, Decorator } from '@storybook/react'
import { CIPViewports } from './viewport'

// Design tokens — order matters: primitive → semantic → component → density
import '../src/tokens/primitive.css'
import '../src/tokens/semantic.css'
import '../src/tokens/component.css'
import '../src/tokens/density.css'

// Base Tailwind utilities
import '../src/styles/globals.css'

// ── Global decorator: applies theme / density / locale to the html element ──
const withTokens: Decorator = (Story, { globals }) => {
  const root = document.documentElement
  root.dataset.theme   = globals['theme']   ?? 'light'
  root.dataset.density = globals['density'] ?? 'comfortable'
  root.lang            = globals['locale']  ?? 'en'
  return <Story />
}

const preview: Preview = {
  // ── Global toolbar controls ────────────────────────────────────────────────
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Switch between light, dark, and high-contrast modes',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          { value: 'light',         title: 'Light',          icon: 'sun'           },
          { value: 'dark',          title: 'Dark',           icon: 'moon'          },
          { value: 'high-contrast', title: 'High Contrast',  icon: 'accessibility' },
        ],
      },
    },

    density: {
      name: 'Density',
      description: 'UI density — compact for dashboards, spacious for forms',
      defaultValue: 'comfortable',
      toolbar: {
        icon: 'expand',
        dynamicTitle: true,
        items: [
          { value: 'compact',     title: 'Compact'     },
          { value: 'comfortable', title: 'Comfortable' },
          { value: 'spacious',    title: 'Spacious'    },
        ],
      },
    },

    locale: {
      name: 'Locale',
      description: 'Language / regional formatting',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        dynamicTitle: true,
        items: [
          { value: 'en', right: '🇬🇧', title: 'English'  },
          { value: 'ne', right: '🇳🇵', title: 'Nepali'   },
        ],
      },
    },
  },

  decorators: [withTokens],

  // ── Default parameters ─────────────────────────────────────────────────────
  parameters: {
    // Disable Storybook's built-in background picker — we use the theme token
    backgrounds: { disable: true },

    // Map on[A-Z] props to action logger automatically
    actions: { argTypesRegex: '^on[A-Z].*' },

    // Control matchers
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },

    // Accessibility — run with every story
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name',    enabled: true },
          { id: 'image-alt',      enabled: true },
        ],
      },
    },

    // Viewports — register CIP custom sizes
    viewport: {
      viewports: CIPViewports,
      defaultViewport: 'desktop',
    },

    // Docs page layout
    docs: {
      toc: true,
    },
  },
}

export default preview
