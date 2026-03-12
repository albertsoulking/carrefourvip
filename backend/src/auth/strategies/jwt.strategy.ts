import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminService } from '../../admin/admin.service';
import { UsersService } from '../../users/users.service';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private adminService: AdminService,
        private usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfig.secret
        });
        console.log(
            'JWT Strategy initialized with secret:',
            jwtConfig.secret.substring(0, 3) + '***'
        );
    }

    async validate(payload: any) {
        try {
            // Check if the token is for an admin or a user based on the userType in the payload
            if (payload.userType === 'admin') {
                const admin = await this.adminService.findOne(payload.sub);
                if (!admin) {
                    throw new UnauthorizedException('Admin not found');
                }
                return { ...admin, userType: 'admin' };
            } else if (payload.userType === 'user') {
                const user = await this.usersService.findOne(payload.sub);
                if (!user) {
                    throw new UnauthorizedException('User not found');
                }
                return { ...user, userType: 'user' };
            } else {
                // For backward compatibility or default case
                return {
                    id: payload.sub,
                    email: payload.email,
                    role: payload.role,
                    name: payload.name
                };
            }
        } catch (error) {
            console.error('JWT validation error:', error.message);
            throw new UnauthorizedException('Token validation failed');
        }
    }
}
