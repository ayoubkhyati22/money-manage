// src/App.tsx ou src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DarkModeProvider } from './hooks/useDarkMode'

// Pages
import { Login } from './pages/Login'
import { Dashboard } from './components/Dashboard/Dashboard'
import { StocksPage } from './pages/StocksPage'
import { GoalsPage } from './pages/GoalsPage'
import { BanksPage } from './pages/BanksPage'
import { TransactionsPage } from './pages/TransactionsPage'

// Layout
import { MainLayout } from './components/Layout/MainLayout'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/stocks" element={<StocksPage />} />
                      <Route path="/goals" element={<GoalsPage />} />
                      <Route path="/banks" element={<BanksPage />} />
                      <Route path="/transactions" element={<TransactionsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </DarkModeProvider>
    </BrowserRouter>
  )
}

export default App