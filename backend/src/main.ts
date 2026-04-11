import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS
    app.enableCors({
        origin: [
            // 'https://giftmall.shop',
            // 'https://kkkk.giftmall.shop',
            // 'https://carrefour-vip.com',
            // 'https://admin.carrefour-vip.com',
            // 'https://api.carrefour-vip.com',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174'
        ],
        credentials: true
    });

    // Manually set Access-Control-Allow-Origin header for all responses
    app.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        next();
    });

    app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
        prefix: '/uploads/'
    });

    // Enable validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties that don't have decorators
            transform: true, // Transform payloads to DTO instances
            forbidNonWhitelisted: true // Throw errors when non-whitelisted properties are present
        })
    );

    app.setGlobalPrefix('api'); // Set global prefix for all routes
    app.set('trust proxy', true);

    // Setup Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Carrfour API')
        .setDescription('The Carrefour API description')
        .setVersion('1.0')
        .addTag('admin', 'Admin operations')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header'
            },
            'JWT-auth' // This name is used for reference in the security requirement object
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Setup Swagger UI options
    const customOptions = {
        swaggerOptions: {
            persistAuthorization: true
        }
    };

    SwaggerModule.setup('api', app, document, customOptions);

    // ========================
    // ✅ Bull Board 注入开始
    // ========================
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    // 获取队列实例（名字要和你 BullModule 注册时一样，比如 'order'）
    const queueNames = ['order', 'transaction', 'auth'];
    const queues = queueNames.map(
        (name) => new BullAdapter(app.get<Queue>(getQueueToken(name)))
    );

    createBullBoard({
        queues,
        serverAdapter
    });

    // 注册 Bull Board 到路由
    app.use('/admin/queues', serverAdapter.getRouter());

    // ========================
    // ✅ Bull Board 注入结束
    // ========================

    // Start server
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Application is running on: ${await app.getUrl()}`);
    console.log(`📘 Swagger available at: ${await app.getUrl()}/api`);
    console.log(
        `📊 Bull Board available at: ${await app.getUrl()}/admin/queues`
    );
}

bootstrap();
