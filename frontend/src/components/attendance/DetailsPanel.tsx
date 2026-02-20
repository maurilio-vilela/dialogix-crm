import {
  ArrowLeftRight,
  Calendar,
  ClipboardList,
  Briefcase,
  Folder,
  CheckCircle2,
  Inbox,
  Info,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Tag,
  ClipboardCheck,
  FileText,
  Star,
  StickyNote,
  ExternalLink,
  Receipt,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DetailsPanelProps {
  hasConversation: boolean;
  contactName?: string;
  contactInitials?: string;
  status?: string;
  email?: string;
  phone?: string;
}

export function DetailsPanel({
  hasConversation,
  contactName,
  contactInitials,
  status,
  email,
  phone,
}: DetailsPanelProps) {
  if (!hasConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <Info className="w-16 h-16 mb-4 opacity-50" />
        <p>Selecione uma conversa para ver os detalhes</p>
      </div>
    );
  }

  const tags = ['VIP', 'Recorrente', 'E-commerce'];
  const orders = [
    { id: '#12345', status: 'Em trânsito', value: 'R$ 299,90', date: '20/01/2024' },
    { id: '#12346', status: 'Pago', value: 'R$ 159,00', date: '18/01/2024' },
  ];

  return (
    <div className="flex-1 p-4 space-y-6 overflow-y-auto">
      <div className="text-center rounded-2xl border bg-muted/20 p-4">
        <div className="relative w-24 h-24 rounded-full bg-background mx-auto mb-2 flex items-center justify-center border">
          <span className="text-3xl font-bold text-muted-foreground">{contactInitials}</span>
          <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
        </div>
        <h3 className="text-lg font-semibold">{contactName}</h3>
        <Badge className="mt-2 rounded-full bg-primary/10 text-primary">Cliente VIP</Badge>
      </div>

      <div className="space-y-3 rounded-2xl border bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </span>
            <h4 className="font-semibold">Contato</h4>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {email && (
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p>{email}</p>
              </div>
            </div>
          )}
          {phone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p>{phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Localização</p>
              <p>São Paulo - SP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border bg-background p-4">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </span>
          <h4 className="font-semibold">Atividade</h4>
        </div>
        <div className="space-y-2 text-sm">
          {[
            ['Primeiro contato', '15/01/2024'],
            ['Última interação', 'Hoje, 10:30'],
            ['Total de conversas', '24'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border bg-background p-4">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Tag className="h-4 w-4" />
          </span>
          <h4 className="font-semibold">Tags</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full bg-muted text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border bg-background p-4">
        {[{
          title: 'Funil',
          icon: ClipboardCheck,
          description: 'Criar etapa no funil.',
          actionIcon: Send,
          accent: 'bg-emerald-500/10 text-emerald-600',
        }, {
          title: 'Protocolo',
          icon: FileText,
          description: 'Protocolo do Atendimento.',
          actionIcon: ExternalLink,
          accent: 'bg-muted text-muted-foreground',
        }, {
          title: 'Avaliação',
          icon: Star,
          description: 'Avaliação do Atendimento.',
          actionIcon: Send,
          accent: 'bg-amber-500/10 text-amber-600',
        }].map(({ title, icon: Icon, description, actionIcon: ActionIcon, accent }) => (
          <div key={title} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className={`h-9 w-9 rounded-full flex items-center justify-center ${accent}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h5 className="font-semibold">{title}</h5>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <button type="button" className="text-muted-foreground hover:text-foreground">
              <ActionIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <StickyNote className="h-4 w-4" />
            </span>
            <h4 className="font-semibold">Notas</h4>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <StickyNote className="h-3.5 w-3.5" />
            Registrar
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
        <textarea
          className="w-full min-h-[88px] rounded-xl border bg-muted/30 p-3 text-sm"
          placeholder="Notas de atendimento..."
        />
      </div>

      <div className="space-y-3 rounded-2xl border bg-background p-4">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Receipt className="h-4 w-4" />
          </span>
          <h4 className="font-semibold">Pedidos Recentes</h4>
        </div>
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{order.id}</span>
                <Badge variant="outline" className="text-xs">
                  {order.status}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{order.value}</span>
                <span>{order.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border bg-background p-4">
        <h4 className="font-semibold">Atalhos rápidos</h4>
        <div className="grid gap-2">
          <Button variant="outline" className="justify-start gap-2">
            <ArrowLeftRight className="h-4 w-4" /> Transferir
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Calendar className="h-4 w-4" /> Agendar
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <ClipboardList className="h-4 w-4" /> Criar tarefa
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Briefcase className="h-4 w-4" /> Oportunidade
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Folder className="h-4 w-4" /> Arquivos
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <CheckCircle2 className="h-4 w-4" /> Finalizar atendimento
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Inbox className="h-4 w-4" /> Enviar para fila
          </Button>
        </div>
      </div>
    </div>
  );
}
