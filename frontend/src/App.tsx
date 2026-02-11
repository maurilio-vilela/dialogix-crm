import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import AttendancePage from './pages/Attendance/AttendancePage';
import ContactsPage from './pages/Contacts/ContactsPage';
import PipelinePage from './pages/Pipeline/PipelinePage';
import TasksPage from './pages/Tasks/TasksPage';
import AIAgentsPage from './pages/AIAgents/AIAgentsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import BillingPage from './pages/Billing/BillingPage';

// Layout
import MainLayout from './components/layout/MainLayout';

// Store
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/atendimento" element={<AttendancePage />} />
              <Route path="/contatos" element={<ContactsPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/tarefas" element={<TasksPage />} />
              <Route path="/agentes-ia" element={<AIAgentsPage />} />
              <Route path="/relatorios" element={<ReportsPage />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="/financeiro" element={<BillingPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  );
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
}

export default App;
