import { Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Auth from '@/pages/Auth'
import Index from '@/pages/Index'
import { AuthProvider } from '@/hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/app/*" element={<Index />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
