import { addons } from '@storybook/manager-api'
import { cipTheme }  from './theme'

addons.setConfig({
  theme: cipTheme,

  // Show category roots (Atoms / Molecules / Organisms / Construction)
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },

  // Keep the panel (Controls / A11y / Interactions) at the bottom
  panelPosition: 'bottom',

  // Always show the toolbar (theme / density / locale switchers)
  isToolshown: true,
})
