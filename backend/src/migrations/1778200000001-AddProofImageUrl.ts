import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofImageUrl1778200000001 implements MigrationInterface {
    name = 'AddProofImageUrl1778200000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`proofImageUrl\` varchar(512) NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`proofImageUrl\``
        );
    }
}
