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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

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
      if (editingContact) {
        // Update
        await api.patch(`/contacts/${editingContact.id}`, data);
        toast.success('Contato atualizado com sucesso!');
      } else {
        // Create
        await api.post('/contacts', data);
        toast.success('Contato criado com sucesso!');
      }
      closeModal();
      fetchContacts();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar contato.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openCreateModal = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  }

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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={closeModal}>
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          </DialogHeader>
          <ContactForm 
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isLoading={isSubmitting}
            initialData={editingContact || {}}
          />
        </DialogContent>
      </Dialog>

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
                      <Button variant="ghost" size="icon" className="text-destructive">
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
