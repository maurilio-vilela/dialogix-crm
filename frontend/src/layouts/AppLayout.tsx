import { Navigate, Outlet } from 'react-router-dom';
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
            <li><a href="/" className="block py-2">Dashboard</a></li>
            <li><a href="/contacts" className="block py-2">Contatos</a></li>
            <li><a href="/chat-test" className="block py-2 text-green-400">🧪 Teste WebSocket</a></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}
