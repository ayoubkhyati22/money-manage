// src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DarkModeProvider } from './hooks/useDarkMode'
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

  // If user is logged in, redirect to dashboard, otherwise show landing page
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} />

            {/* Protected Dashboard Route */}
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

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-text, #374151)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--toast-border, #E5E7EB)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <style>{`
            .dark {
              --toast-bg: #1c3731;
              --toast-text: #dce6e4;
              --toast-border: #245048;
            }
          `}</style>
        </BrowserRouter>
      </AuthProvider>
    </DarkModeProvider>
  )
}

export default App