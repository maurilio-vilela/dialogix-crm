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

  @Column()
  tenantId: string;

  @Column({ type: 'varchar', nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contactId' })
  contact: Contact;

  @Column({ type: 'varchar', nullable: true })
  assignedUserId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;

  @Column({
    type: 'enum',
    enum: ConversationChannel,
    default: ConversationChannel.WHATSAPP,
  })
  channel: ConversationChannel;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.OPEN,
  })
  status: ConversationStatus;

  @Column({ type: 'varchar', nullable: true })
  externalId: string; // ID da conversa no canal externo (WhatsApp, etc.)

  @Column({ type: 'text', nullable: true })
  lastMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ type: 'int', default: 0 })
  unreadCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dados extras do canal (número, nome do grupo, etc.)

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
