import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export function AppLayout() {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Dialogix</h1>
        <nav className="mt-8">
          <ul>
            <li><Link to="/" className="block py-2">Dashboard</Link></li>
            <li><Link to="/atendimento" className="block py-2">Atendimento</Link></li>
            <li><Link to="/contacts" className="block py-2">Contatos</Link></li>
            <li><Link to="/chat-test" className="block py-2 text-green-400">🧪 Teste WebSocket</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}
