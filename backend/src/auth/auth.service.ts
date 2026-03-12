import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import { UsersService } from '../users/users.service';
import { LoginActivitiesService } from '../login-activities/login-activities.service';
import { Request } from 'express';
import { UtilityService } from 'src/utility/utility.service';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import {
    LoginType,
    UserType
} from 'src/login-activities/enum/login-activities.enum';
import { LogoutDto } from './dto/logout.dto';
import { IpService } from 'src/ip/ip.service';
import { TwoFactorAuthenticationService } from 'src/2fa/2fa.service';
import { JobsQueue } from 'src/jobs/jobs.queue';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly adminService: AdminService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly loginActivitiesService: LoginActivitiesService,
        private readonly utilityService: UtilityService,
        private readonly ipService: IpService,
        private readonly twoFactorService: TwoFactorAuthenticationService,
        private readonly jobsQueue: JobsQueue
    ) {}

    async adminLogin(dto: LoginDto, req: Request) {
        try {
            // Get admin by email directly from repository
            const admin = await this.adminService.findByEmail(dto.email);

            // Check if admin exists
            if (!admin) {
                throw new UnauthorizedException('Invalid Credentials');
            }

            // Check if admin is active
            if (!admin.status) {
                throw new UnauthorizedException('Invalid Input');
            }

            // Compare passwords
            const isPasswordValid = await this.utilityService.comparePasswords(
                dto.password,
                admin.password
            );
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid Password');
            }

            // get login ip info
            const geoInfo = await this.ipService.getGeoInfoByIp(req);

            if (admin.twoFactorEnabled === 1) {
                const isValid = await this.twoFactorService.verify2FACode(
                    admin.id,
                    dto.token
                );

                if (!isValid) {
                    return {
                        access_token: null,
                        admin: {
                            id: admin.id,
                            name: admin.name,
                            email: admin.email,
                            role: admin.role,
                            geoInfo,
                            twoFactorEnabled: admin.twoFactorEnabled
                        }
                    };
                }
            }

            // Create JWT payload
            const payload = {
                sub: admin.id,
                email: admin.email,
                role: admin.role,
                name: admin.name
            };

            const token = this.jwtService.sign(payload);
            console.log('Generated JWT token successfully');

            admin.loginIp = geoInfo?.ip;
            await this.adminRepo.save(admin);
            console.log('Admin login IP saved successfully');

            // Record login activity for admin
            await this.loginActivitiesService.recordLoginActivity(req, {
                userId: admin.id,
                userType: UserType.ADMIN,
                type: LoginType.LOGIN
            });
            console.log('Login activity recorded successfully');

            // 记录最后登录时间
            await this.adminService.updateLastLogin(admin.id);
            console.log('Last login time updated successfully');

            // token 到期自动退出登录
            await this.jobsQueue.scheduleAdminLogout(admin.id, req);

            return {
                access_token: token,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    geoInfo,
                    twoFactorEnabled: admin.twoFactorEnabled
                }
            };
        } catch (error) {
            console.error('Authentication error:', error.message);
            throw new UnauthorizedException(
                'Authentication failed: ' + error.message
            );
        }
    }

    async userLogin(dto: LoginDto, req: Request) {
        try {
            // Get user by email
            const user = await this.usersService.findByEmail(dto.email);
            console.log('findbyemail', user);
            // Check if user exists
            if (!user) {
                console.log(`User with email ${dto.email} not found`);
                throw new UnauthorizedException('Invalid credentials');
            }

            // Check if user is active
            if (!user.status) {
                throw new UnauthorizedException('User account is inactive');
            }

            // Print password details for debugging (remove in production)
            console.log(`Comparing passwords: Input vs DB`);
            console.log(`Input password: ${dto.password}`);
            console.log(`User from DB:`, {
                id: user.id,
                email: user.email,
                role: user.role
            });

            // Compare passwords
            const isMatch = await this.utilityService.comparePasswords(
                dto.password,
                user.password
            );
            console.log(`Password valid: ${isMatch}`);

            if (!isMatch) {
                throw new UnauthorizedException('Invalid password');
            }

            // Create JWT payload
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                avater: user.avatar,
                balance: user.balance,
                mode: user.mode
            };

            const token = this.jwtService.sign(payload);
            console.log('Generated JWT token successfully');

            const geoInfo = await this.ipService.getGeoInfoByIp(req);

            user.loginIp = geoInfo?.ip;
            await this.userRepo.save(user);
            console.log('User login IP saved successfully');

            // Record login activity for user
            await this.loginActivitiesService.recordLoginActivity(req, {
                userId: user.id,
                userType: UserType.USER,
                type: LoginType.LOGIN
            });
            console.log('Login activity recorded successfully');

            // 记录最后登录时间
            await this.usersService.updateLastLogin(user.id);
            console.log('Last login time updated successfully');

            // token 到期自动退出登录
            await this.jobsQueue.scheduleUserLogout(user.id, req);

            return {
                access_token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar,
                    balance: user.balance,
                    mode: user.mode,
                    geoInfo
                }
            };
        } catch (error) {
            console.error('User authentication error:', error.message);
            throw new UnauthorizedException(
                'Authentication failed: ' + error.message
            );
        }
    }

    /**
     * Logout function (stateless JWT: client should discard token)
     * Optionally, you can record logout activity.
     */
    async logout(dto: LogoutDto, req: Request): Promise<{ message: string }> {
        try {
            await this.loginActivitiesService.recordLoginActivity(req, {
                userId: dto.userId,
                userType: dto.userType,
                type: LoginType.LOGOUT
            });

            const user = await this.userRepo.findOneBy({ id: dto.userId });
            const admin = await this.adminRepo.findOneBy({ id: dto.userId });
            if (user) await this.usersService.updateLastLogin(user.id);
            if (admin) await this.adminService.updateLastLogin(admin.id);
        } catch (error) {
            console.error('Failed to record logout activity:', error);
        }
        // For JWT, logout is handled on client side by discarding the token
        return { message: 'Logout successful' };
    }

    /**
     * Change password for user or admin
     * @param userId
     * @param oldPassword
     * @param newPassword
     * @param userType 'user' | 'admin'
     */
    async changePassword(
        userId: number,
        oldPassword: string,
        newPassword: string,
        userType: UserType
    ): Promise<{ message: string }> {
        if (!userId || !oldPassword || !newPassword)
            throw new UnauthorizedException('Missing required fields');

        if (oldPassword === newPassword)
            throw new InternalServerErrorException(
                'New password can not be current password!'
            );

        let user: any;
        if (userType === 'admin') {
            user = await this.adminService.findById(userId);
            if (!user) throw new UnauthorizedException('Admin not found');
            // Compare plain password (for admin, as per your code)
            if (user.password !== oldPassword) {
                throw new UnauthorizedException(
                    'Current password is incorrect'
                );
            }
            const hashed = await this.utilityService.hashPassword(newPassword);

            await this.adminService.updatePassword(userId, hashed);

            await this.adminService.updateLastLogin(user.id);
        } else {
            user = await this.usersService.findById(userId);
            if (!user) throw new UnauthorizedException('User not found');
            // Compare hashed password (for user)
            const isMatch = await this.utilityService.comparePasswords(
                oldPassword,
                user.password
            );
            if (!isMatch) {
                throw new UnauthorizedException(
                    'Current password is incorrect'
                );
            }
            const hashed = await this.utilityService.hashPassword(newPassword);
            await this.usersService.updatePassword(userId, hashed);

            await this.usersService.updateLastLogin(user.id);
        }

        return { message: 'Password changed successfully' };
    }
}
