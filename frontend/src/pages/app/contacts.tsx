import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContactForm, ContactFormData } from './contacts/components/ContactForm';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Plus, Search, Trash2, Edit } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
}

export function ContactsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<{ type: 'create' | 'edit' | 'delete' | null, data?: Contact }>({ type: null });

  // Query: buscar contatos
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await api.get('/contacts');
      return response.data;
    },
  });

  // Mutation: criar contato
  const createMutation = useMutation({
    mutationFn: (data: ContactFormData) => api.post('/contacts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setModalState({ type: null });
      toast.success('Contato criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar contato.');
    },
  });

  // Mutation: atualizar contato
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactFormData }) =>
      api.patch(`/contacts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setModalState({ type: null });
      toast.success('Contato atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar contato.');
    },
  });

  // Mutation: excluir contato
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setModalState({ type: null });
      toast.success('Contato excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir contato.');
    },
  });

  const handleFormSubmit = (data: ContactFormData) => {
    if (modalState.type === 'edit' && modalState.data) {
      updateMutation.mutate({ id: modalState.data.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteContact = () => {
    if (modalState.type === 'delete' && modalState.data) {
      deleteMutation.mutate(modalState.data.id);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">Contatos</h2>
          <p className="text-muted-foreground">
            Gerencie seus clientes e leads em um só lugar.
          </p>
        </div>
        <Button onClick={() => setModalState({ type: 'create' })} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Contato
        </Button>
      </div>
      
      {/* Modals */}
      <Dialog open={modalState.type === 'create' || modalState.type === 'edit'} onOpenChange={() => setModalState({ type: null })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modalState.type === 'edit' ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          </DialogHeader>
          <ContactForm 
            onSubmit={handleFormSubmit}
            onCancel={() => setModalState({ type: null })}
            isLoading={isSubmitting}
            initialData={modalState.type === 'edit' ? modalState.data : {}}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={modalState.type === 'delete'} onOpenChange={() => setModalState({ type: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O contato "{modalState.data?.name}" será movido para a lixeira.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteContact} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>Listagem</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Carregando...</div>
          ) : (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhum contato encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
                        <TableCell className="hidden lg:table-cell">{contact.phone}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {contact.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setModalState({ type: 'edit', data: contact })}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setModalState({ type: 'delete', data: contact })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
