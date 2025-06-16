import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedDocumentSchema1750099420591 implements MigrationInterface {
    name = 'UpdatedDocumentSchema1750099420591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "s3Url" TO "s3Key"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "s3Key" TO "s3Url"`);
    }

}
