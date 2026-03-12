import { Command, CommandRunner, Option } from 'nest-commander';
import { AdminService } from '../admin/admin.service';
import { Injectable } from '@nestjs/common';

interface CreateAdminOptions {
  name: string;
  email: string;
  password: string;
  role?: string;
  referralCode?: string;
}

@Injectable()
@Command({ name: 'create-admin', description: 'Create a new admin user' })
export class CreateAdminCommand extends CommandRunner {
  constructor(private readonly adminService: AdminService) {
    super();
  }

  async run(
    passedParams: string[],
    options: CreateAdminOptions = { name: '', email: '', password: '' },
  ): Promise<void> {
    try {
      if (!options?.email || !options?.password || !options?.name) {
        console.error('Missing required parameters: name, email, and password are required');
        return;
      }
      
      // const admin = await this.adminService.create({
      //   name: options.name,
      //   email: options.email,
      //   password: options.password,
      //   roleName: options.role || 'admin',
      //   referralCode: options.referralCode,
      // });

      // console.log(`Admin user created successfully with ID: ${admin.id}`);
      console.log('Command Done')
    } catch (error) {
      console.error('Failed to create admin user:', error.message);
    }
  }

  @Option({
    flags: '-n, --name [name]',
    description: 'Admin name',
  })
  parseName(val: string): string {
    return val;
  }

  @Option({
    flags: '-e, --email [email]',
    description: 'Admin email',
  })
  parseEmail(val: string): string {
    return val;
  }

  @Option({
    flags: '-p, --password [password]',
    description: 'Admin password',
  })
  parsePassword(val: string): string {
    return val;
  }

  @Option({
    flags: '-r, --role [role]',
    description: 'Admin role (default: admin)',
  })
  parseRole(val: string): string {
    return val;
  }

  @Option({
    flags: '-c, --referral-code [referralCode]',
    description: 'Unique referral code for user registration',
  })
  parseReferralCode(val: string): string {
    return val;
  }
}
