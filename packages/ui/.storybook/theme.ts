import { create } from '@storybook/theming/create'

export const cipTheme = create({
  base: 'dark',

  // Brand
  brandTitle: 'CIP Design System',
  brandUrl:   '/',
  brandTarget: '_self',

  // Primary accent (CIP blue)
  colorPrimary:   '#4A7CF7',
  colorSecondary: '#4A7CF7',

  // App chrome — matches CIP sidebar palette
  appBg:           '#0E1420',
  appContentBg:    '#141C2E',
  appPreviewBg:    '#F8FAFC',
  appBorderColor:  '#253350',
  appBorderRadius: 8,

  // Typography
  fontBase: '"Inter", system-ui, -apple-system, sans-serif',
  fontCode: '"JetBrains Mono", "Fira Code", monospace',

  // Text
  textColor:        '#D0DBF2',
  textInverseColor: '#0E1420',
  textMutedColor:   '#7A8BAF',

  // Toolbar
  barTextColor:     '#7A8BAF',
  barSelectedColor: '#4A7CF7',
  barHoverColor:    '#D0DBF2',
  barBg:            '#0E1420',

  // Inputs (search, controls)
  inputBg:           '#1C2640',
  inputBorder:       '#253350',
  inputTextColor:    '#D0DBF2',
  inputBorderRadius: 6,

  // Buttons inside Storybook UI
  buttonBg:     '#1C2640',
  buttonBorder: '#253350',
})
