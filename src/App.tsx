// src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DarkModeProvider } from './hooks/useDarkMode'
import { UIProvider } from './components/UIProvider'
import { Layout } from './components/Layout'
import { AuthForm } from './components/AuthForm'
import { Dashboard } from './components/Dashboard'
import { LandingPage } from './components/LandingPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 dark:border-primary-400"></div>
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

function App() {
  return (
    <DarkModeProvider>
      <UIProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/auth" element={<AuthForm />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/signup" element={<Navigate to="/auth" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </UIProvider>
    </DarkModeProvider>
  )
}

export default App
