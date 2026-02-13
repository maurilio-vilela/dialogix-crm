import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/axios';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  User,
  MapPin,
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'conversation' | 'deal' | 'note';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

export function ContactDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: contact, isLoading } = useQuery<Contact>({
    queryKey: ['contact', id],
    queryFn: async () => {
      const response = await api.get(`/contacts/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando contato...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-xl text-muted-foreground mb-4">Contato não encontrado</p>
        <Button onClick={() => navigate('/contacts')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Contatos
        </Button>
      </div>
    );
  }

  // Mock timeline data (será substituído por dados reais no futuro)
  const timeline: TimelineEvent[] = [
    {
      id: '1',
      type: 'created',
      title: 'Contato criado',
      description: 'Cadastrado no sistema',
      timestamp: contact.createdAt,
      icon: User,
      color: 'text-blue-500',
    },
  ];

  if (contact.updatedAt !== contact.createdAt) {
    timeline.push({
      id: '2',
      type: 'updated',
      title: 'Informações atualizadas',
      description: 'Dados do contato foram modificados',
      timestamp: contact.updatedAt,
      icon: CheckCircle2,
      color: 'text-green-500',
    });
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-blue-100 text-blue-800 border-blue-200',
      cliente: 'bg-green-100 text-green-800 border-green-200',
      inativo: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-heading">{contact.name}</h2>
            <p className="text-muted-foreground">Visão completa do contato</p>
          </div>
        </div>
        <Button>Editar Contato</Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Nenhuma conversa ainda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Nenhum deal aberto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Contato</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Sem interações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Informações do Contato (2/3) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm truncate">{contact.email || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p className="text-sm truncate">{contact.phone || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                    <p className="text-sm truncate">{contact.company || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
                    <p className="text-sm">{formatDate(contact.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Conversas (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conversas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Nenhuma conversa registrada ainda.</p>
                <p className="text-xs mt-2">
                  As conversas aparecerão aqui quando o módulo de atendimento estiver ativo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline (1/3) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                {timeline.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={event.id} className="relative pl-8 pb-4 last:pb-0">
                      {/* Linha vertical */}
                      {index !== timeline.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
                      )}
                      
                      {/* Ícone */}
                      <div className={`absolute left-0 top-0 rounded-full bg-background border-2 border-border p-1 ${event.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Conteúdo */}
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Card de Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled>
                <MessageSquare className="mr-2 h-4 w-4" />
                Iniciar Conversa
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <TrendingUp className="mr-2 h-4 w-4" />
                Criar Oportunidade
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Mail className="mr-2 h-4 w-4" />
                Enviar E-mail
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Disponível em breve
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
