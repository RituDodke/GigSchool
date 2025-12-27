import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { api } from '@/api/client'
import AuthPage from '@/pages/AuthPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'

const queryClient = new QueryClient()

function Dashboard() {
  const { user, signOut } = useAuthStore()

  const { data: apiStatus } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/')
      return res.data
    }
  })

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">GigSchool Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <button
            onClick={() => signOut()}
            className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="grid gap-6">
          {/* Stats Card */}
          <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold mb-2">System Status</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <pre className="text-xs">{JSON.stringify(apiStatus, null, 2)}</pre>
            </div>
          </div>

          {/* Placeholder for Jobs */}
          <div className="p-12 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
            Job Board Component will go here.
          </div>
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
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Catch all redirect to home (which will redirect to auth) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
