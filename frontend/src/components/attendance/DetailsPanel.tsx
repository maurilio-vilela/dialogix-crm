import {
  ArrowLeftRight,
  Calendar,
  ClipboardList,
  Briefcase,
  Folder,
  CheckCircle2,
  Inbox,
  Info,
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

  return (
    <div className="flex-1 p-4 space-y-6 overflow-y-auto">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
          <span className="text-3xl font-bold text-muted-foreground">{contactInitials}</span>
        </div>
        <h3 className="text-lg font-semibold">{contactName}</h3>
        {status && <Badge className="mt-2 capitalize">{status}</Badge>}
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Informações</h4>
        {email && (
          <p className="text-sm">
            <strong>Email:</strong> {email}
          </p>
        )}
        {phone && (
          <p className="text-sm">
            <strong>Telefone:</strong> {phone}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Atalhos</h4>
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
