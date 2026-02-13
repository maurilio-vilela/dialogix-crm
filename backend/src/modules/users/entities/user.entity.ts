import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Não retorna a senha por padrão
  password?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ default: 'agent' })
  role: string;

  @Column({ type: 'json', nullable: true })
  permissions?: any;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
