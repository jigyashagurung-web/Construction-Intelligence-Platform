import type { ViewportMap } from '@storybook/types'

export const CIPViewports: ViewportMap = {
  mobileS: {
    name: 'Phone S — 360 px (budget Android)',
    styles: { width: '360px', height: '780px' },
    type: 'mobile',
  },
  mobileL: {
    name: 'Phone L — 430 px (iPhone 15 Pro Max)',
    styles: { width: '430px', height: '932px' },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet — 768 px (site iPad)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet',
  },
  laptop: {
    name: 'Laptop — 1024 px',
    styles: { width: '1024px', height: '768px' },
    type: 'desktop',
  },
  desktop: {
    name: 'Desktop — 1280 px',
    styles: { width: '1280px', height: '800px' },
    type: 'desktop',
  },
  wide: {
    name: 'Wide — 1536 px (executive dashboard)',
    styles: { width: '1536px', height: '960px' },
    type: 'desktop',
  },
}
