import { useEffect, useState } from 'react';
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
import { ContactForm, ContactFormData } from './ContactForm';
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<{ type: 'create' | 'edit' | 'delete' | null, data?: Contact }>({ type: null });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contacts');
      setContacts(response.data);
    } catch (error) {
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleFormSubmit = async (data: ContactFormData) => {
    const isEditing = modalState.type === 'edit';
    const promise = isEditing
      ? api.patch(`/contacts/${modalState.data!.id}`, data)
      : api.post('/contacts', data);

    toast.promise(promise, {
      loading: 'Salvando...',
      success: () => {
        fetchContacts();
        setModalState({ type: null });
        return `Contato ${isEditing ? 'atualizado' : 'criado'} com sucesso!`;
      },
      error: `Erro ao salvar contato.`,
    });
  };

  const handleDeleteContact = async () => {
    if (modalState.type !== 'delete' || !modalState.data) return;
    
    toast.promise(api.delete(`/contacts/${modalState.data.id}`), {
      loading: 'Excluindo...',
      success: () => {
        fetchContacts();
        setModalState({ type: null });
        return 'Contato excluído com sucesso!';
      },
      error: 'Erro ao excluir contato.',
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            isLoading={false} // Gerenciado pelo toast.promise
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
            <AlertDialogAction onClick={handleDeleteContact} className="bg-destructive hover:bg-destructive/90">
              Excluir
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
          {loading ? (
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
