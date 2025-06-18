import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedErrorFromIngestionSchema1750275157281 implements MigrationInterface {
    name = 'RemovedErrorFromIngestionSchema1750275157281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingestion_logs" DROP COLUMN "error"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingestion_logs" ADD "error" character varying`);
    }

}
