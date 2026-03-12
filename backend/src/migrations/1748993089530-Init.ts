import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748993089530 implements MigrationInterface {
    name = 'Init1748993089530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`role\` \`role\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`referralCode\` \`referralCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`latitude\` \`latitude\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`longitude\` \`longitude\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`notes\` \`notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`discountedPrice\` \`discountedPrice\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`imageUrl\` \`imageUrl\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`preparationTimeMinutes\` \`preparationTimeMinutes\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`variants\` \`variants\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`addons\` \`addons\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`imageUrl\` \`imageUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`parentId\` \`parentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`restaurantId\` \`restaurantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`detail\` \`detail\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`reference_id\` \`reference_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`deposit_withdrawals\` CHANGE \`payment_id\` \`payment_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`deposit_withdrawals\` CHANGE \`transaction_id\` \`transaction_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`deposit_withdrawals\` CHANGE \`rate\` \`rate\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`deposit_withdrawals\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`orderId\` \`orderId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`variants\` \`variants\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`addons\` \`addons\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`notes\` \`notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`restaurantId\` \`restaurantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`restaurantId\` \`restaurantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deliveryId\` \`deliveryId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`couponId\` \`couponId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`specialInstructions\` \`specialInstructions\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deliveryAddress\` \`deliveryAddress\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`parentId\` \`parentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`deliveryAddresses\` \`deliveryAddresses\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_gateways\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_gateways\` CHANGE \`config\` \`config\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`user_messages\` CHANGE \`sender_id\` \`sender_id\` int NULL`);
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
        await queryRunner.query(`ALTER TABLE \`user_messages\` CHANGE \`sender_id\` \`sender_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment_gateways\` CHANGE \`config\` \`config\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment_gateways\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`deliveryAddresses\` \`deliveryAddresses\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`parentId\` \`parentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`user_id\` \`user_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deliveryAddress\` \`deliveryAddress\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`specialInstructions\` \`specialInstructions\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`couponId\` \`couponId\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deliveryId\` \`deliveryId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`restaurantId\` \`restaurantId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`restaurantId\` \`restaurantId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`notes\` \`notes\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`addons\` \`addons\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`variants\` \`variants\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`orderId\` \`orderId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`deposit_withdrawals\` CHANGE \`user_id\` \`user_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`deposit_withdrawals\` CHANGE \`rate\` \`rate\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`deposit_withdrawals\` CHANGE \`transaction_id\` \`transaction_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`deposit_withdrawals\` CHANGE \`payment_id\` \`payment_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`user_id\` \`user_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`reference_id\` \`reference_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`detail\` \`detail\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`restaurantId\` \`restaurantId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`parentId\` \`parentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`imageUrl\` \`imageUrl\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`categories\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`addons\` \`addons\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`variants\` \`variants\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`preparationTimeMinutes\` \`preparationTimeMinutes\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`imageUrl\` \`imageUrl\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`discountedPrice\` \`discountedPrice\` float(12) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`food_items\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`notes\` \`notes\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`longitude\` \`longitude\` float(12) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`locations\` CHANGE \`latitude\` \`latitude\` float(12) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`referralCode\` \`referralCode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`admins\` CHANGE \`role\` \`role\` varchar(255) NULL DEFAULT 'NULL'`);
    }

}
