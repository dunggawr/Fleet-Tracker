import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetCodeToUser1778512254345 implements MigrationInterface {
  name = 'AddResetCodeToUser1778512254345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_code_expiry" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "reset_code_expiry"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_code"`);
  }
}
