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
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedContact) { // Modo Edição
        await api.patch(`/contacts/${selectedContact.id}`, data);
        toast.success('Contato atualizado com sucesso!');
      } else { // Modo Criação
        await api.post('/contacts', data);
        toast.success('Contato criado com sucesso!');
      }
      closeFormModal();
      fetchContacts();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar contato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      await api.delete(`/contacts/${selectedContact.id}`);
      toast.success('Contato excluído com sucesso!');
      closeDeleteModal();
      fetchContacts();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir contato.');
    }
  };
  
  const openCreateModal = () => {
    setSelectedContact(null);
    setIsFormModalOpen(true);
  };
  
  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setIsFormModalOpen(true);
  };
  
  const openDeleteModal = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedContact(null);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedContact(null);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">Contatos</h2>
          <p className="text-muted-foreground">
            Gerencie seus clientes e leads em um só lugar.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Novo Contato
        </Button>
      </div>

      {/* Modal de Criar/Editar */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={closeFormModal}>
          <DialogHeader>
            <DialogTitle>{selectedContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          </DialogHeader>
          <ContactForm 
            onSubmit={handleFormSubmit}
            onCancel={closeFormModal}
            isLoading={isSubmitting}
            initialData={selectedContact || {}}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Excluir */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O contato será movido para a lixeira.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteModal}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Listagem</CardTitle>
            <div className="relative w-72">
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
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhum contato encontrado. Crie um novo!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {contact.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(contact)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteModal(contact)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
