import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionDepositEnhancements1778100000001
    implements MigrationInterface
{
    name = 'TransactionDepositEnhancements1778100000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`transactions\` MODIFY COLUMN \`method\` enum ('stripe','paypal','balance','hybrid','card','pay2s','lemon','behalf','starpay','faf','wise','bank_transfer') NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` MODIFY COLUMN \`hybridMethod\` enum ('stripe','paypal','balance','hybrid','card','pay2s','lemon','behalf','starpay','faf','wise','bank_transfer') NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` MODIFY COLUMN \`type\` enum ('deposit','withdrawal','order_payment','adjustment') NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`reference\` varchar(255) NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`remark\` text NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`proofImage\` varchar(255) NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`currency\` varchar(8) NOT NULL DEFAULT 'EUR'`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`beforeBalance\` decimal(10,2) NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`afterBalance\` decimal(10,2) NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`processedAt\` datetime(6) NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` ADD \`processedById\` int NULL`
        );
        await queryRunner.query(
            `CREATE INDEX \`IDX_transactions_user_status\` ON \`transactions\` (\`userId\`, \`status\`)`
        );
        await queryRunner.query(
            `CREATE INDEX \`IDX_transactions_type_created\` ON \`transactions\` (\`type\`, \`createdAt\`)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX \`IDX_transactions_type_created\` ON \`transactions\``
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_transactions_user_status\` ON \`transactions\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`processedById\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`processedAt\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`afterBalance\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`beforeBalance\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`currency\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`proofImage\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`remark\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` DROP COLUMN \`reference\``
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` MODIFY COLUMN \`type\` enum ('deposit','withdrawal','order_payment') NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` MODIFY COLUMN \`hybridMethod\` enum ('stripe','paypal','balance','hybrid','card','pay2s','lemon','behalf','starpay','faf','wise') NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE \`transactions\` MODIFY COLUMN \`method\` enum ('stripe','paypal','balance','hybrid','card','pay2s','lemon','behalf','starpay','faf','wise') NOT NULL`
        );
    }
}
