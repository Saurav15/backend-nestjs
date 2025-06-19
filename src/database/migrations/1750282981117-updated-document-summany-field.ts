import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedDocumentSummanyField1750282981117 implements MigrationInterface {
    name = 'UpdatedDocumentSummanyField1750282981117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "processedDataUrl" TO "summary"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "summary"`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "summary" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "summary"`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "summary" character varying`);
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "summary" TO "processedDataUrl"`);
    }

}
