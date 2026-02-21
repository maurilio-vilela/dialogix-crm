import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWhatsappSessions1709000000000 implements MigrationInterface {
  name = 'CreateWhatsappSessions1709000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "whatsapp_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "session_id" VARCHAR(128) NOT NULL,
        "status" VARCHAR(32) NOT NULL,
        "phone_number" VARCHAR(20),
        "display_name" VARCHAR(255),
        "last_update_at" TIMESTAMPTZ,
        "last_heartbeat_at" TIMESTAMPTZ,
        "error_message" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        UNIQUE ("tenant_id"),
        UNIQUE ("session_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_sessions" CASCADE`);
  }
}
