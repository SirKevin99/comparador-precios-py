import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AuthGuard from './components/AuthGuard'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ProductPage from './pages/ProductPage'
import SearchPage from './pages/SearchPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
})

function ThemeInitializer() {
  useTheme()
  return null
}

function AuthInitializer() {
  useAuth()
  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <AuthInitializer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
