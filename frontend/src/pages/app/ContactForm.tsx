import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';

const contactSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: Partial<ContactFormData>;
}

export function ContactForm({ onSubmit, onCancel, isLoading, initialData }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register('name')} disabled={isLoading} />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} disabled={isLoading} />
        {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register('phone')} disabled={isLoading} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" {...register('company')} disabled={isLoading} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Contato'}
        </Button>
      </div>
    </form>
  );
}
