import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import CashierDashboard from './pages/cashier/CashierDashboard';
import type { Rol } from './types';
import { Utensils, LogOut, User as UserIcon } from 'lucide-react';

function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();

  if (!usuario) return null;

  const navItems: { to: string; label: string; roles: Rol[] }[] = [
    { to: '/admin', label: 'Admin', roles: ['administrador'] },
    { to: '/waiter', label: 'Mozo', roles: ['mozo', 'administrador'] },
    { to: '/kitchen', label: 'Cocina', roles: ['cocina', 'administrador'] },
    { to: '/cashier', label: 'Caja', roles: ['cajero', 'administrador'] },
  ];

  const visibles = navItems.filter((item) => item.roles.includes(usuario.rol));

  return (
    <header className="bg-amber-600 text-white px-6 py-3.5 shadow-md flex flex-wrap justify-between items-center gap-3">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5 font-bold text-lg">
          <Utensils className="w-6 h-6" />
          <span>Pollería El Buen Sabor</span>
        </div>

        <nav className="flex items-center gap-1.5">
          {visibles.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-white text-amber-800 font-semibold'
                    : 'bg-amber-700/60 hover:bg-amber-700 text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-amber-700/70 px-3 py-1.5 rounded-full text-sm">
          <UserIcon className="w-4 h-4" />
          <span className="font-medium">{usuario.nombre}</span>
          <span className="text-xs uppercase bg-amber-900/60 px-2 py-0.5 rounded-full">
            {usuario.rol}
          </span>
        </div>

        <button
          type="button"
          onClick={cerrarSesion}
          className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['administrador']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/waiter/*"
                element={
                  <ProtectedRoute allowedRoles={['mozo', 'administrador']}>
                    <WaiterDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute allowedRoles={['cocina', 'administrador']}>
                    <KitchenDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cashier"
                element={
                  <ProtectedRoute allowedRoles={['cajero', 'administrador']}>
                    <CashierDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
