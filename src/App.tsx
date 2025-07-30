import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { DatabaseProvider } from '@/providers/DatabaseProvider';
import AppRoutes from '@/routes/AppRoutes';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DatabaseProvider>
          <AppRoutes />
          <Toaster />
        </DatabaseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
