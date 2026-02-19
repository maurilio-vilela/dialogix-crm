import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastMessageToConversations1708300000000 implements MigrationInterface {
  name = 'AddLastMessageToConversations1708300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "last_message" TEXT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN IF EXISTS "last_message"`);
  }
}
