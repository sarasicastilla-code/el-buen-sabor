import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Rol[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(usuario.rol)) {
    const rutasPorRol: Record<Rol, string> = {
      administrador: '/admin',
      mozo: '/waiter',
      cocina: '/kitchen',
      cajero: '/cashier',
    };
    return <Navigate to={rutasPorRol[usuario.rol]} replace />;
  }

  return <>{children}</>;
};