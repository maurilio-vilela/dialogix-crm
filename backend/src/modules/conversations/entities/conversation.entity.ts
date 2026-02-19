import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { Message } from '../../messages/entities/message.entity';

export enum ConversationStatus {
  OPEN = 'open',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export enum ConversationChannel {
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  WEBCHAT = 'webchat',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedUserId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  // No banco atual existe channel_id (UUID). Mantemos mapeado aqui.
  @Column({ name: 'channel_id', type: 'uuid', nullable: true })
  channel: string;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.OPEN,
  })
  status: ConversationStatus;

  @Column({ name: 'last_message', type: 'text', nullable: true })
  lastMessage: string;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ name: 'unread_count', type: 'int', default: 0 })
  unreadCount: number;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
