import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1750630483491 implements MigrationInterface {
    name = 'Init1750630483491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`icon\` \`icon\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`parentId\` \`parentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` CHANGE \`roleId\` \`roleId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` CHANGE \`menuId\` \`menuId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`referralCode\` \`referralCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`roleId\` \`roleId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`parentId\` \`parentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`receiverName\` \`receiverName\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`receiverMobile\` \`receiverMobile\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`transactionNumber\` \`transactionNumber\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`imageUrl\` \`imageUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`parentId\` \`parentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`favorites\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`favorites\` CHANGE \`productId\` \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`carts\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`carts\` CHANGE \`productId\` \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`imageUrl\` \`imageUrl\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`productImage\` \`productImage\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`productDesc\` \`productDesc\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`imageUrl\` \`imageUrl\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`paymentLink\` \`paymentLink\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`paidAt\` \`paidAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`estimatedProcessingAt\` \`estimatedProcessingAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`processingAt\` \`processingAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`estimatedShippedAt\` \`estimatedShippedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`shippedAt\` \`shippedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`estimatedDeliveredAt\` \`estimatedDeliveredAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deliveredAt\` \`deliveredAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`cancelledAt\` \`cancelledAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`avatar\` \`avatar\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`city\` \`city\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`state\` \`state\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`zipCode\` \`zipCode\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`country\` \`country\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`referralCode\` \`referralCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`roleId\` \`roleId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`parentId\` \`parentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_gateways\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_gateways\` CHANGE \`config\` \`config\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`user_messages\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`ip\` \`ip\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`browser\` \`browser\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`device\` \`device\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`os\` \`os\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`details\` \`details\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`adminId\` \`adminId\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`adminId\` \`adminId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`details\` \`details\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`os\` \`os\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`device\` \`device\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`browser\` \`browser\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`ip\` \`ip\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`login_activity\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user_messages\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment_gateways\` CHANGE \`config\` \`config\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment_gateways\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`parentId\` \`parentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`roleId\` \`roleId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`referralCode\` \`referralCode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`country\` \`country\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`zipCode\` \`zipCode\` varchar(20) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`state\` \`state\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`city\` \`city\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`avatar\` \`avatar\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`cancelledAt\` \`cancelledAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deliveredAt\` \`deliveredAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`estimatedDeliveredAt\` \`estimatedDeliveredAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`shippedAt\` \`shippedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`estimatedShippedAt\` \`estimatedShippedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`processingAt\` \`processingAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`estimatedProcessingAt\` \`estimatedProcessingAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`paidAt\` \`paidAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`paymentLink\` \`paymentLink\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`imageUrl\` \`imageUrl\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`productDesc\` \`productDesc\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`productImage\` \`productImage\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`imageUrl\` \`imageUrl\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`carts\` CHANGE \`productId\` \`productId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`carts\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`favorites\` CHANGE \`productId\` \`productId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`favorites\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`parentId\` \`parentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`imageUrl\` \`imageUrl\` varchar(255) CHARACTER SET "utf8" COLLATE "utf8_general_ci" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`description\` \`description\` text CHARACTER SET "utf8" COLLATE "utf8_general_ci" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`transactionNumber\` \`transactionNumber\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`receiverMobile\` \`receiverMobile\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`receiverName\` \`receiverName\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`parentId\` \`parentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`roleId\` \`roleId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`referralCode\` \`referralCode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` CHANGE \`menuId\` \`menuId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` CHANGE \`roleId\` \`roleId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`parentId\` \`parentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`icon\` \`icon\` varchar(255) NULL DEFAULT 'NULL'`);
    }

}
