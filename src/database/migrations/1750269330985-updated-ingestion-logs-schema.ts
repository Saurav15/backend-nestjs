import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedIngestionLogsSchema1750269330985 implements MigrationInterface {
    name = 'UpdatedIngestionLogsSchema1750269330985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingestion_logs" ADD "attempt_id" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_ingestion_log_attempt_id" ON "ingestion_logs" ("attempt_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_ingestion_log_attempt_id"`);
        await queryRunner.query(`ALTER TABLE "ingestion_logs" DROP COLUMN "attempt_id"`);
    }

}
