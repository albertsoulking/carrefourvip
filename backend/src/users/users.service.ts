import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UtilityService } from 'src/utility/utility.service';
import * as path from 'path';
import { RoleType } from 'src/role/enum/role.enum';
import { Admin } from 'src/admin/entities/admin.entity';
import { Role } from 'src/role/entity/role.entity';
import { Request } from 'express';
import { UserMode } from './enum/user.enum';
import { IpService } from 'src/ip/ip.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        private readonly utilityService: UtilityService,
        private readonly ipService: IpService,
        private readonly notiService: NotificationService
    ) {}

    async create(dto: CreateUserDto, req: Request): Promise<User> {
        // Check if email already exists
        const existingUserByEmail = await this.userRepo.findOne({
            where: { email: dto.email }
        });
        if (existingUserByEmail) {
            throw new ConflictException('Email already exists');
        }

        // Check if phone already exists
        const existingUserByPhone = await this.userRepo.findOne({
            where: { phone: dto.phone }
        });

        if (existingUserByPhone) {
            throw new ConflictException('Phone number already exists');
        }

        // Verify the referral code is valid (from an admin)
        try {
            let admin:Admin | null = null;

            if (dto.referralCode) {
                // 有邀请码：直接查，不管 role
                admin = await this.adminRepo
                    .createQueryBuilder('admin')
                    .where('admin.referralCode = :referralCode', {
                        referralCode: dto.referralCode
                    })
                    .getOne();
            } else {
                // 没邀请码：找最早创建的 admin
                admin = await this.adminRepo
                    .createQueryBuilder('admin')
                    .orderBy('admin.createdAt', 'ASC') // 最早
                    .getOne();
            }

            const role = await this.roleRepo.findOneBy({
                name: RoleType.CUSTOMER
            });
            if (!role) {
                throw new NotFoundException('Role not found');
            }

            // Hash the password
            const hashedPassword = await this.utilityService.hashPassword(
                dto.password
            );

            const geoInfo = await this.ipService.getGeoInfoByIp(req);

            // Create user with hashed password and set parent ID to the admin ID
            let user = this.userRepo.create({
                ...dto,
                ip: geoInfo?.ip,
                loginIp: geoInfo?.ip,
                role,
                latitude: geoInfo?.latitude?.toString(),
                longitude: geoInfo?.longitude?.toString(),
                city: geoInfo?.city,
                zipCode: geoInfo?.postal,
                state: geoInfo?.region,
                country: geoInfo?.country_name,
                password: hashedPassword,
                parent: admin,
                mode: UserMode.LIVE
            });

            user = await this.userRepo.save(user);

            await this.notiService.sendNotification({
                title: 'New Register/新客户注册',
                content: `上级：${admin?.name}, 客户ID: ${user.id}, 邮箱：${user.email}, 国家：${geoInfo?.country_name ?? '本地'}`,
                type: NotificationType.USER,
                path: '/customers',
                createdAt: new Date(),
                userId: user.id,
                targetId: user.id,
                userType: UserType.ADMIN,
                enableNoti: 1
            });

            return user;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(
                'Error verifying referral code: ' + error.message
            );
        }
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['role'],
            select: {
                id: true,
                avatar: true,
                name: true,
                email: true,
                phone: true,
                balance: true,
                mode: true,
                point: true,
                role: {
                    id: true,
                    name: true
                }
            }
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        await this.updateLastLogin(user.id);

        return user;
    }

    // Similar to findOne but doesn't throw an exception if user not found
    async findById(id: number): Promise<User | null> {
        return this.userRepo.findOne({
            where: { id },
            relations: ['parent'] // Include parent (admin) relationship
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepo.findOne({ where: { email } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.userRepo.findOne({ where: { username } });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // Check if email is being updated and if it's already taken
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepo.findOne({
                where: { email: updateUserDto.email }
            });
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        // If updating phone, check if it already exists
        if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
            const existingUser = await this.userRepo.findOne({
                where: { phone: updateUserDto.phone }
            });
            if (existingUser) {
                throw new ConflictException('Phone number already exists');
            }
        }

        // If updating avatar
        if (updateUserDto.avatar && updateUserDto.avatar !== user.avatar) {
            // delete old image
            const oldFilePath = path.join(
                process.cwd(),
                '..',
                'uploads',
                'images',
                user.avatar ?? ''
            );
            await this.utilityService.removeImageFromServer(oldFilePath);
        }

        // Check if the image url is changed
        if (updateUserDto.avatar !== user.avatar) {
            if (
                updateUserDto.avatar === undefined &&
                updateUserDto.avatar === null &&
                typeof updateUserDto.avatar !== 'string' &&
                (updateUserDto.avatar as string).trim() === ''
            ) {
                throw new NotFoundException(`User avatar is invalid`);
            }

            // delete old image
            const oldFilePath = path.join(
                process.cwd(),
                '..',
                'uploads',
                'images',
                user.avatar ?? ''
            );
            await this.utilityService.removeImageFromServer(oldFilePath);
        }

        await this.updateLastLogin(user.id);

        // Update user with new data
        Object.assign(user, updateUserDto);
        return await this.userRepo.save(user);
    }

    async remove(id: number): Promise<void> {
        const result = await this.userRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    // Methods for admin-facing operations
    async updateEmailVerificationStatus(
        id: number,
        status: boolean
    ): Promise<User> {
        const user = await this.findOne(id);
        user.emailVerified = status;
        return await this.userRepo.save(user);
    }

    async updateMobileVerificationStatus(
        id: number,
        status: boolean
    ): Promise<User> {
        const user = await this.findOne(id);
        user.mobileVerified = status;
        return await this.userRepo.save(user);
    }

    async updateKycVerificationStatus(
        id: number,
        status: boolean
    ): Promise<User> {
        const user = await this.findOne(id);
        user.kycVerified = status;
        return await this.userRepo.save(user);
    }

    async updatePassword(
        userId: number,
        hashedPassword: string
    ): Promise<User> {
        const user = await this.findOne(userId);
        user.password = hashedPassword;

        return await this.userRepo.save(user);
    }

    async updateLastLogin(userId: number) {
        await this.userRepo.update(userId, { lastLoginAt: new Date() });
    }
}
