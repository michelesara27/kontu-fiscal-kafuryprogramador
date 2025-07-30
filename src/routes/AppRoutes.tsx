import { useRoutes } from 'react-router-dom';
import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Clientes } from '@/pages/Clientes';
import { Obrigacoes } from '@/pages/Obrigacoes';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';

function AppRoutes() {
  const { user } = useAuth();

  const routes = useRoutes([
    {
      path: '/',
      element: <Landing />,
    },
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
      ],
    },
    {
      path: '/app',
      element: <ProtectedRoute />,
      children: [
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'clientes', element: <Clientes /> },
        { path: 'obrigacoes', element: <Obrigacoes /> },
      ],
    },
  ]);

  return routes;
}

export default AppRoutes;
