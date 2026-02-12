import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1707750000000 implements MigrationInterface {
  name = 'CreateInitialTables1707750000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. TENANTS (Empresas)
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(20),
        "logo_url" TEXT,
        "primary_color" VARCHAR(7) DEFAULT '#6366f1',
        "secondary_color" VARCHAR(7) DEFAULT '#8b5cf6',
        "timezone" VARCHAR(50) DEFAULT 'America/Sao_Paulo',
        "language" VARCHAR(5) DEFAULT 'pt-BR',
        "status" VARCHAR(20) DEFAULT 'trial',
        "subscription_plan" VARCHAR(50) DEFAULT 'starter',
        "max_users" INTEGER DEFAULT 5,
        "max_contacts" INTEGER DEFAULT 1000,
        "max_channels" INTEGER DEFAULT 3,
        "trial_ends_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 2. USERS (Usuários)
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "avatar_url" TEXT,
        "role" VARCHAR(50) DEFAULT 'agent',
        "permissions" JSON,
        "phone" VARCHAR(20),
        "status" VARCHAR(20) DEFAULT 'active',
        "last_login_at" TIMESTAMP,
        "email_verified_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP,
        UNIQUE ("tenant_id", "email")
      )
    `);

    // 3. CONTACTS (Contatos)
    await queryRunner.query(`
      CREATE TABLE "contacts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255),
        "phone" VARCHAR(20),
        "avatar_url" TEXT,
        "company" VARCHAR(255),
        "position" VARCHAR(100),
        "notes" TEXT,
        "custom_fields" JSON,
        "source" VARCHAR(50),
        "status" VARCHAR(20) DEFAULT 'active',
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 4. CHANNELS (Canais de Comunicação)
    await queryRunner.query(`
      CREATE TABLE "channels" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "type" VARCHAR(50) NOT NULL,
        "status" VARCHAR(20) DEFAULT 'disconnected',
        "config" JSON,
        "qr_code" TEXT,
        "phone_number" VARCHAR(20),
        "is_default" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 5. CONVERSATIONS (Conversas)
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "contact_id" uuid NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
        "channel_id" uuid NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
        "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "protocol" VARCHAR(20) UNIQUE,
        "status" VARCHAR(20) DEFAULT 'open',
        "last_message_at" TIMESTAMP,
        "unread_count" INTEGER DEFAULT 0,
        "rating" INTEGER,
        "rating_comment" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 6. MESSAGES (Mensagens)
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
        "sender_type" VARCHAR(20) NOT NULL,
        "sender_id" uuid,
        "body" TEXT,
        "media_url" TEXT,
        "media_type" VARCHAR(50),
        "is_internal" BOOLEAN DEFAULT false,
        "status" VARCHAR(20) DEFAULT 'sent',
        "external_id" VARCHAR(255),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 7. TAGS (Etiquetas)
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" VARCHAR(100) NOT NULL,
        "color" VARCHAR(7) DEFAULT '#6366f1',
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP,
        UNIQUE ("tenant_id", "name")
      )
    `);

    // 8. CONTACT_TAGS (Relacionamento Contatos x Tags)
    await queryRunner.query(`
      CREATE TABLE "contact_tags" (
        "contact_id" uuid NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
        "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY ("contact_id", "tag_id")
      )
    `);

    // 9. PIPELINES (Funis de Vendas)
    await queryRunner.query(`
      CREATE TABLE "pipelines" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "is_default" BOOLEAN DEFAULT false,
        "position" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 10. PIPELINE_STAGES (Etapas do Funil)
    await queryRunner.query(`
      CREATE TABLE "pipeline_stages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "pipeline_id" uuid NOT NULL REFERENCES "pipelines"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "color" VARCHAR(7) DEFAULT '#6366f1',
        "position" INTEGER DEFAULT 0,
        "probability" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 11. DEALS (Oportunidades)
    await queryRunner.query(`
      CREATE TABLE "deals" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "pipeline_id" uuid NOT NULL REFERENCES "pipelines"("id") ON DELETE CASCADE,
        "stage_id" uuid NOT NULL REFERENCES "pipeline_stages"("id") ON DELETE CASCADE,
        "contact_id" uuid NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
        "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "value" DECIMAL(15,2) DEFAULT 0,
        "currency" VARCHAR(3) DEFAULT 'BRL',
        "status" VARCHAR(20) DEFAULT 'open',
        "expected_close_date" TIMESTAMP,
        "closed_at" TIMESTAMP,
        "lost_reason" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 12. TASKS (Tarefas)
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "contact_id" uuid REFERENCES "contacts"("id") ON DELETE CASCADE,
        "deal_id" uuid REFERENCES "deals"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "type" VARCHAR(50) DEFAULT 'call',
        "priority" VARCHAR(20) DEFAULT 'medium',
        "status" VARCHAR(20) DEFAULT 'pending',
        "due_date" TIMESTAMP,
        "completed_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 13. QUICK_REPLIES (Respostas Rápidas)
    await queryRunner.query(`
      CREATE TABLE "quick_replies" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "shortcut" VARCHAR(50) NOT NULL,
        "message" TEXT NOT NULL,
        "media_url" TEXT,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP,
        UNIQUE ("tenant_id", "shortcut")
      )
    `);

    // 14. AI_AGENTS (Agentes de IA)
    await queryRunner.query(`
      CREATE TABLE "ai_agents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "provider" VARCHAR(50) NOT NULL,
        "model" VARCHAR(100) NOT NULL,
        "system_prompt" TEXT,
        "temperature" DECIMAL(3,2) DEFAULT 0.7,
        "max_tokens" INTEGER DEFAULT 1000,
        "is_active" BOOLEAN DEFAULT true,
        "handoff_keywords" JSON,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 15. SUBSCRIPTIONS (Assinaturas)
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "plan" VARCHAR(50) NOT NULL,
        "status" VARCHAR(20) DEFAULT 'active',
        "current_period_start" TIMESTAMP,
        "current_period_end" TIMESTAMP,
        "cancel_at" TIMESTAMP,
        "canceled_at" TIMESTAMP,
        "stripe_subscription_id" VARCHAR(255),
        "stripe_customer_id" VARCHAR(255),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // 16. PAYMENTS (Pagamentos)
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "subscription_id" uuid REFERENCES "subscriptions"("id") ON DELETE CASCADE,
        "amount" DECIMAL(15,2) NOT NULL,
        "currency" VARCHAR(3) DEFAULT 'BRL',
        "status" VARCHAR(20) DEFAULT 'pending',
        "payment_method" VARCHAR(50),
        "stripe_payment_id" VARCHAR(255),
        "paid_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // Criar índices para performance
    await queryRunner.query(`CREATE INDEX "idx_users_tenant" ON "users"("tenant_id") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_contacts_tenant" ON "contacts"("tenant_id") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_contacts_phone" ON "contacts"("phone") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_contacts_email" ON "contacts"("email") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_conversations_tenant" ON "conversations"("tenant_id") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_conversations_contact" ON "conversations"("contact_id") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_conversations_assigned" ON "conversations"("assigned_to") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_messages_conversation" ON "messages"("conversation_id", "created_at" DESC) WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_messages_tenant" ON "messages"("tenant_id") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_deals_tenant_stage" ON "deals"("tenant_id", "stage_id") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_assigned" ON "tasks"("assigned_to", "due_date") WHERE "deleted_at" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_agents" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quick_replies" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deals" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pipeline_stages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pipelines" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_tags" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "channels" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contacts" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants" CASCADE`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
