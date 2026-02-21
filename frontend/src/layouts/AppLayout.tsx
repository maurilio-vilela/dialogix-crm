import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Zap,
  Users,
  Calendar,
  Megaphone,
  Bot,
  Building2,
  Headphones,
  Clock,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
  Tag,
  MessageCircle,
  Plug,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Atendimentos', to: '/inbox', icon: MessageSquare },
  { label: 'Pipeline', to: '/pipeline', icon: BarChart3 },
  { label: 'Mensagens Rápidas', to: '/quick-replies', icon: Zap },
  { label: 'Tags', to: '/tags', icon: Tag },
  { label: 'Contatos', to: '/contacts', icon: Users },
  { label: 'Agendamentos', to: '/appointments', icon: Calendar },
  { label: 'Campanhas', to: '/campaigns', icon: Megaphone },
  { label: 'Chat Interno', to: '/internal-chat', icon: MessageCircle },
  { label: 'Agentes de IA', to: '/ai-agents', icon: Bot },
  { label: 'Chatbot', to: '/chatbot', icon: Bot },
  { label: 'Departamentos', to: '/departments', icon: Building2 },
  { label: 'Canais de atendimento', to: '/channels', icon: Headphones },
  { label: 'Integrações', to: '/integrations', icon: Plug },
  { label: 'Usuários', to: '/users', icon: Users },
  { label: 'Horários', to: '/business-hours', icon: Clock },
  { label: 'Relatórios', to: '/reports', icon: BarChart3 },
  { label: 'Financeiro', to: '/financial', icon: Wallet },
  { label: 'Configurações', to: '/settings', icon: Settings },
  { label: 'Ajuda', to: '/help', icon: HelpCircle },
];

export function AppLayout() {
  const { token } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background/90 backdrop-blur lg:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm"
          onClick={() => setIsDark((prev) => !prev)}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <div className="flex min-h-[calc(100vh-56px)] lg:min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-muted/40 backdrop-blur transition-transform duration-200 lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center">
                D
              </div>
              {!isCollapsed && <span className="text-lg font-semibold">Dialogix</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="hidden lg:inline-flex p-2 rounded-lg hover:bg-muted"
                onClick={() => setIsCollapsed((prev) => !prev)}
              >
                <ChevronLeft className={`h-4 w-4 transition ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                className="hidden lg:inline-flex p-2 rounded-lg hover:bg-muted"
                onClick={() => setIsDark((prev) => !prev)}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <nav className="px-2 py-4 space-y-1 overflow-y-auto h-[calc(100%-120px)]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/80 hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-3 py-4 border-t">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 lg:p-6 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
