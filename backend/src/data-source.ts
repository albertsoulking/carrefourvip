import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

const debug = true; // 切换到生产环境时改为 false
dotenv.config({ path: debug ? '.env.dev' : '.env' });

export const AppDataSource = new DataSource({
    type: 'mysql',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.DB_SYNC === 'true',
    logging: true,
    timezone: '+08:00',
    entities: [join(__dirname + '/**/*.entity.{ts,js}')],
    migrations: [join(__dirname + '/migrations/*.{ts,js}')],
    subscribers: []
});
