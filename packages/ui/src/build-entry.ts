// Library build entry — used by vite.config.lib.ts only, not Storybook.
// Re-exports everything from the main barrel and attaches the CSS side-effect
// so Vite extracts it to dist/style.css.

// CSS side-effect (extracted to dist/style.css during build)
import './styles/index.css'

export * from './index'
