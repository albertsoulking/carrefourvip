import {
    Injectable,
    Inject,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as nodemailer from 'nodemailer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UtilityService } from 'src/utility/utility.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly utilityService: UtilityService
    ) {}

    async generate2FASecret(adminId: number) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const secret = speakeasy.generateSecret({
            issuer: 'Carrefour Admin',
            name: `${admin.name}/${admin.email}`
        });
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

        // 没有两步验证才保存
        if (admin.twoFactorEnabled === 0) {
            // 保存 secret.base32 到数据库
            admin.twoFactorSecret = secret.base32;
            await this.adminRepo.save(admin);
        }

        return { qrCodeUrl, secret: secret.base32 };
    }

    async verify2FACode(adminId: number, token: string | undefined) {
        if (!token) return false;

        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        if (!admin.twoFactorSecret)
            throw new InternalServerErrorException('Invalid Code!');

        const isValid = speakeasy.totp.verify({
            secret: admin.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1
        });
        
        if (isValid) {
            admin.twoFactorEnabled = isValid ? 1 : 0;
            await this.adminRepo.save(admin);
        }

        return isValid;
    }

    async sendEmailCode(email: string) {
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6位数字
        await this.cacheManager.set(`2fa_${email}`, code); // 5分钟有效

        const transporter = nodemailer.createTransport({
            service: 'gmail', // 或者QQ邮箱等
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            text: `Your code is ${code}. It will expire in 5 minutes.`
        });

        return { message: 'Code sent' };
    }

    async verifyEmailCode(email: string, code: string) {
        const storedCode = await this.cacheManager.get(`2fa_${email}`);
        if (storedCode === code) {
            return { success: true };
        }
        throw new Error('Invalid code');
    }

    async verifyAdmin(adminId: number, password: string) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const isPasswordValid = await this.utilityService.comparePasswords(
            password,
            admin.password
        );
        if (!isPasswordValid)
            throw new InternalServerErrorException('Password Incorrect!');

        return true;
    }

    async remove2FAVerification(adminId: number, token: string) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        if (!admin.twoFactorSecret)
            throw new InternalServerErrorException('Invalid Code!');

        const isValid = speakeasy.totp.verify({
            secret: admin.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (isValid) {
            admin.twoFactorSecret = null;
            admin.twoFactorEnabled = 0;
            await this.adminRepo.save(admin);
        }

        return isValid;
    }
}
