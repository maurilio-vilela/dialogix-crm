import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export function AuthLayout() {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Outlet />
    </div>
  );
}
