import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, LogOut, HardHat, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/lib/queryClient'

export function AppLayout() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)

  async function handleSignOut() {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-gray-900 text-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-700">
          <HardHat size={22} className="text-blue-400" />
          <span className="font-semibold text-sm tracking-wide">CIP</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <LayoutDashboard size={16} />
            Projects
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <FolderOpen size={16} />
            All Projects
          </NavLink>
          {profile?.role === 'admin' && (
            <NavLink
              to="/team"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Users size={16} />
              Team
            </NavLink>
          )}
        </nav>

        {/* User strip */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-semibold">
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
