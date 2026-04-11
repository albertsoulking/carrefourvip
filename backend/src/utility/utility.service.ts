import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    forwardRef
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { existsSync } from 'fs';
import fetch from 'node-fetch';
import * as Jimp from 'jimp'; // ✅ 可用于 Jimp.read()
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/role/entity/role.entity';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { RoleMenuService } from 'src/role/role_menu.service';
import { PaymentProviderAdminService } from 'src/payment-gateways/payment-provider.admin.service';
import { PaymentGatewayAdminService } from 'src/payment-gateways/payment-gateways.admin.service';
import { SettingAdminService } from 'src/settings/setting.admin.service';

@Injectable()
export class UtilityService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        private readonly logService: LogService,
        private readonly roleMenuService: RoleMenuService,
        @Inject(forwardRef(() => PaymentProviderAdminService))
        private readonly paymentProviderAdminService: PaymentProviderAdminService,
        @Inject(forwardRef(() => PaymentGatewayAdminService))
        private readonly paymentGatewayAdminService: PaymentGatewayAdminService,
        private readonly SettingAdminService: SettingAdminService
    ) {}

    private readonly saltRounds = 10;

    /**
     * Hashes a plain text password using bcrypt with the configured number of salt rounds.
     *
     * @param plainPassword - The plain text password to be hashed.
     * @returns A promise that resolves to the hashed password string.
     *
     * @remarks
     * 使用 bcrypt 对明文密码进行加密，采用指定的 saltRounds 进行加盐处理。
     */
    async hashPassword(plainPassword: string): Promise<string> {
        return await bcrypt.hash(plainPassword, this.saltRounds);
    }

    /**
     * Compare two passwords, one is from user enter, one is existed password
     * @param plainPassword - Plain password from textfield
     * @param hashedPassword - Hashed Passwrod from user's password
     * @returns boolean value true or false, after compared
     */
    async comparePasswords(
        plainPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Generates a random integer between min (inclusive) and max (inclusive).
     */
    getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Capitalizes the first letter of a string.
     */
    capitalizeFirstLetter(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Handles image upload, saves the file, and returns the image URL.
     * @param file The uploaded file object (e.g., from Multer)
     * @param uploadDir The directory to save the image
     * @param baseUrl The base URL for accessing the image
     */
    async uploadImageAndGetUrl(file: Express.Multer.File): Promise<{
        url: string;
        name: string;
        origin: string;
        ext: string;
        path: string;
        size: number;
    }> {
        // carefour
        //    |--- admin
        //    |--- user
        //    |--- backend
        //    |--- uploads/images <-- upload path

        // Always build the upload path starting from the project root directory
        const uploadDir = path.join(process.cwd(), '../uploads/images');

        // Ensure upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        // Solve the garbled code
        const originalName = Buffer.from(file.originalname, 'latin1').toString(
            'utf8'
        );

        // Generate unique filename
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);
        const fileSize = file.buffer.length;

        // Save file
        await fs.writeFile(filePath, file.buffer);

        // save thumbnial
        await this.createThumbnail(filePath, fileName);

        // Return accessible image URL as an object
        const uploadData = {
            base: process.env.HOST_BASE_URL,
            url: `${process.env.HOST_BASE_URL}/${fileName}`,
            name: fileName,
            origin: originalName,
            ext: fileExt,
            path: filePath,
            size: fileSize
        };

        return uploadData;
    }

    /**
     * Removes an image file from the server.
     * @param filePath The absolute path to the image file to be removed.
     * @returns A promise that resolves to true if the file was deleted, false if it did not exist.
     */
    async removeImageFromServer(filePath: string): Promise<any> {
        if (existsSync(filePath)) {
            try {
                // await fs.access(filePath);
                // unlinkSync(filePath);
            } catch (error: any) {
                return {
                    statusCode: 500,
                    message: 'Failed to delete old image: ' + error.message,
                    data: null
                };
            }
        } else {
            console.warn('图片文件不存在:', filePath);
        }

        return true;
    }

    async createThumbnail(inputPath: string, outputFile: string, width = 200) {
        const outputPath = path.join(process.cwd(), '../uploads/thumbs');
        const thumbnailPath = path.join(outputPath, outputFile);

        await fs.mkdir(outputPath, { recursive: true });

        if (existsSync(inputPath)) {
            const image = await Jimp.read(inputPath);
            image.resize(width, Jimp.AUTO);
            image.quality(80);
            await image.writeAsync(thumbnailPath);
        }
    }

    async translateToEnglish(keyword: string): Promise<string> {
        const res = await fetch(
            'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=' +
                encodeURIComponent(keyword)
        );
        const data = await res.json();
        if (Array.isArray(data)) {
            return data[0][0][0];
        }

        throw new Error('Unexpected response structure');
    }

    async generateThumbnailsForAllImages(
        req: Request,
        adminId: number,
        page = 1,
        limit = 100
    ): Promise<{
        message: string;
        nextPage: number | null;
        generatedCount: number;
    }> {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const IMAGES_DIR = path.join(process.cwd(), '../uploads/images');
        const THUMBS_DIR = path.join(process.cwd(), '../uploads/thumbs');

        try {
            await fs.mkdir(THUMBS_DIR, { recursive: true });

            const files = await fs.readdir(IMAGES_DIR);
            const validFiles = files.filter((file) =>
                ['.jpg', '.jpeg', '.png', '.webp'].includes(
                    path.extname(file).toLowerCase()
                )
            );

            const startIndex = (page - 1) * limit;
            const paginatedFiles = validFiles.slice(
                startIndex,
                startIndex + limit
            );

            let generatedCount = 0;

            for (const file of paginatedFiles) {
                const inputPath = path.join(IMAGES_DIR, file);
                const thumbPath = path.join(THUMBS_DIR, file);

                if (existsSync(thumbPath)) continue;

                try {
                    await this.createThumbnail(inputPath, file);
                    generatedCount++;
                } catch (err) {
                    throw new InternalServerErrorException(
                        `❌ Thumbnail error for file ${file}: ${err}`
                    );
                }
            }

            const hasNextPage = startIndex + limit < validFiles.length;

            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '批量生成缩略图',
                targetType: '图片',
                description: `[${admin.name}] 点击了 批量生成缩略图 的按钮：请求次数 ${page} 页。`
            });

            return {
                message: `请求次数：${page} [${hasNextPage ? '请求中...' : '请求已完成。'}]`,
                nextPage: hasNextPage ? page + 1 : null,
                generatedCount
            };
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async createOrUpdateAdminAccount(action: 'create' | 'change') {
        const adminExists = await this.adminRepo.findOneBy({
            email: 'admin'
        });
        const hashedPassword = await this.hashPassword('admin123');

        if (action === 'create') {
            if (!adminExists) {
                const adminRole = await this.roleRepo.findOne({
                    where: { name: 'admin' }
                });
                if (adminRole) {
                    await this.adminRepo.save({
                        email: 'admin',
                        name: 'Admin',
                        role: adminRole,
                        password: hashedPassword,
                        referralCode: 'ADMIN'
                    });
                }
            }
        } else if (action === 'change') {
            if (!adminExists)
                throw new BadRequestException('Admin does not exist.');
            adminExists.password = hashedPassword;
            await this.adminRepo.save(adminExists);
        } else {
            throw new BadRequestException('Invalid action.');
        }
    }

    async initWebsite() {
        // 1. 检查角色权限数据是否存在，不存在就创建
        await this.roleMenuService.reset();

        // 2. 检查 admin 账号是否存在，不存在就创建
        await this.createOrUpdateAdminAccount('create');

        // 3. 检查支付网关数据是否存在，不存在就创建
        await this.paymentProviderAdminService.reset();

        // 4. 重置支付通道数据
        await this.paymentGatewayAdminService.reset();

        // 5. 重置配送数据和网站设置
        await this.SettingAdminService.reset();

        return { message: 'Website initialized successfully' };
    }

    async ping() {
        const adminCount = await this.adminRepo.count();
        return { message: 'pong', init: adminCount === 0, timestamp: new Date() };
    }
}
