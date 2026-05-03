import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderPaymentProofImage1778300000001
    implements MigrationInterface
{
    name = 'AddOrderPaymentProofImage1778300000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`orders\` ADD \`paymentProofImage\` varchar(255) NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`orders\` DROP COLUMN \`paymentProofImage\``
        );
    }
}
