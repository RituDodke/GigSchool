import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import AuthPage from '@/pages/AuthPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'
import { JobBoard } from '@/components/jobs/JobBoard'
import { LogOut, Briefcase, Home, User, Settings } from 'lucide-react'

const queryClient = new QueryClient()

function Sidebar() {
  const { user, signOut } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">GigSchool</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link to="/profile" className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}>
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <Link to="/settings" className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}>
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            <p className="text-xs text-gray-500">Free plan</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function DashboardLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-100 px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout title="Gig Board" subtitle="Find and post student gigs">
                <JobBoard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout title="Profile" subtitle="Manage your account">
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout title="Settings" subtitle="Customize your experience">
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
