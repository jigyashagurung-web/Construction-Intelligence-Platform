import * as React from 'react'
import { Header,  type HeaderProps  } from '../Header'
import { Sidebar, type SidebarProps } from '../Sidebar'
import { cn } from '../../utils/cn'

// ── Props ─────────────────────────────────────────────────────────────────────
export interface AppShellProps {
  /** Props forwarded to the Sidebar */
  sidebarProps: Omit<SidebarProps, 'collapsed' | 'onCollapsedChange'>
  /** Props forwarded to the Header */
  headerProps:  Omit<HeaderProps, 'onMenuToggle'>
  /** Main page content */
  children:     React.ReactNode
  className?:   string
}

// ── Component ─────────────────────────────────────────────────────────────────
function AppShell({ sidebarProps, headerProps, children, className }: AppShellProps) {
  const [collapsed,      setCollapsed]      = React.useState(false)
  const [mobileNavOpen,  setMobileNavOpen]  = React.useState(false)

  return (
    <div className={cn('flex h-screen w-full overflow-hidden', className)}>
      {/* ── Sidebar ── */}
      <Sidebar
        {...sidebarProps}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        className={cn(
          // Desktop: always visible
          'hidden lg:flex',
        )}
      />

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              {...sidebarProps}
              collapsed={false}
              onNavigate={(item) => {
                sidebarProps.onNavigate?.(item)
                setMobileNavOpen(false)
              }}
            />
          </div>
        </>
      )}

      {/* ── Right column: header + content ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          {...headerProps}
          onMenuToggle={() => setMobileNavOpen((o) => !o)}
        />

        {/* ── Page content ── */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[--surface-page] p-6"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export { AppShell }
