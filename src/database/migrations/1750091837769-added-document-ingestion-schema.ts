import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDocumentIngestionSchema1750091837769 implements MigrationInterface {
    name = 'AddedDocumentIngestionSchema1750091837769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ingestion_logs_status_enum" AS ENUM('pending', 'started', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "ingestion_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" "public"."ingestion_logs_status_enum" NOT NULL, "details" character varying, "error" character varying, "document_id" uuid, CONSTRAINT "PK_9d48de994c5d2baf86b269156aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_ingestion_log_document_id" ON "ingestion_logs" ("document_id") `);
        await queryRunner.query(`CREATE TYPE "public"."documents_status_enum" AS ENUM('pending', 'started', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "s3Url" character varying NOT NULL, "processedDataUrl" character varying, "status" "public"."documents_status_enum" NOT NULL DEFAULT 'pending', "user_id" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_document_user_id" ON "documents" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "ingestion_logs" ADD CONSTRAINT "FK_5c7a67de72be182fc5670a91641" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_c7481daf5059307842edef74d73" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_c7481daf5059307842edef74d73"`);
        await queryRunner.query(`ALTER TABLE "ingestion_logs" DROP CONSTRAINT "FK_5c7a67de72be182fc5670a91641"`);
        await queryRunner.query(`DROP INDEX "public"."idx_document_user_id"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ingestion_log_document_id"`);
        await queryRunner.query(`DROP TABLE "ingestion_logs"`);
        await queryRunner.query(`DROP TYPE "public"."ingestion_logs_status_enum"`);
    }

}
