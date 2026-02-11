import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { Home, Menu, X, LogOut, History, User, ShieldCheck, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAuthQuery } from '../query/useAuthQuery'
import { Button } from './ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { logout } = useAuthQuery()
  const router = useRouterState()

  const isLoginPage = router.location.pathname === '/login'

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  if (isLoginPage) return null

  return (
    <>
      <header className="h-16 flex items-center justify-between bg-gray-900 text-white px-6 shadow-md border-b border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-white"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">N</div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">KMG Admin</span>
          </Link>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-gray-800 hover:bg-gray-700 p-0 border border-gray-700">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal font-sans">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.isSuperAdmin ? 'Super Administrator' : 'Reporter'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer w-full">Dashboard</Link>
                </DropdownMenuItem>
                {user.isSuperAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/user" className="cursor-pointer w-full">User Management</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/logs" className="cursor-pointer w-full">Activity Logs</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/tags" className="cursor-pointer w-full">Tags Management</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </header>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-950 text-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Control Center</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-all font-medium text-gray-400 hover:text-white group"
            activeProps={{
              className: 'flex items-center gap-3 text-white p-3 bg-gray-800 rounded-xl transition-all font-semibold',
            }}
          >
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            <span>Dashboard</span>
          </Link>

          {user?.isSuperAdmin && (
            <>
              <Link
                to="/user"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-all font-medium text-gray-400 hover:text-white group"
                activeProps={{
                  className: 'flex items-center gap-3 text-white p-3 rounded-xl transition-all font-semibold',
                }}
              >
                <User size={20} className="group-hover:scale-110 transition-transform" />
                <span>User Management</span>
              </Link>
              <Link
                to="/logs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-all font-medium text-gray-400 hover:text-white group"
                activeProps={{
                  className: 'flex items-center gap-3 text-white p-3 rounded-xl transition-all font-semibold',
                }}
              >
                <History size={20} className="group-hover:scale-110 transition-transform" />
                <span>Activity Logs</span>
              </Link>
              <Link
                to="/tags"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-all font-medium text-gray-400 hover:text-white group"
                activeProps={{
                  className: 'flex items-center gap-3 text-white p-3 rounded-xl transition-all font-semibold',
                }}
              >
                <Tag size={20} className="group-hover:scale-110 transition-transform" />
                <span>Tags Management</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
