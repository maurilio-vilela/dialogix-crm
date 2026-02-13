import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  TEMPLATE = 'template',
  SYSTEM = 'system', // Mensagens automáticas (ex: "Conversa iniciada")
}

export enum MessageDirection {
  INBOUND = 'inbound',   // Do contato para a empresa
  OUTBOUND = 'outbound', // Da empresa para o contato
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ type: 'varchar', nullable: true })
  senderUserId: string; // ID do usuário que enviou (se outbound)

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderUserId' })
  senderUser: User;

  @Column({ type: 'varchar', nullable: true })
  senderContactId: string; // ID do contato que enviou (se inbound)
  
  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderContactId' })
  senderContact: Contact;

  @Column({
    type: 'enum',
    enum: MessageDirection,
  })
  direction: MessageDirection;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column('text')
  content: string; // Conteúdo da mensagem ou URL da mídia

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dados extras (caption, filename, etc.)

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
