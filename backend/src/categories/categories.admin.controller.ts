import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminCategoryService } from './categories.admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Request } from 'express';
import { SearchCategoryDto } from './dto/search-category.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('admin/categories')
export class AdminCategoryController {
    constructor(private adminCategoryService: AdminCategoryService) {}

    @Post('get-all-categories')
    getAllCategories(@Req() req: Request, @Body() dto: SearchCategoryDto) {
        const adminId = (req as any)?.user.id;
        return this.adminCategoryService.getAllCategories(adminId, dto);
    }

    @Post('create-category')
    createCategory(
        @Req() req: Request,
        @Body() createCategoryDto: CreateCategoryDto
    ) {
        const adminId = (req as any)?.user.id;
        return this.adminCategoryService.createCategory(
            adminId,
            createCategoryDto,
            req
        );
    }

    @Post('update-category')
    updateCategory(
        @Req() req: Request,
        @Body() updateCategoryDto: UpdateCategoryDto
    ) {
        const adminId = (req as any)?.user.id;
        return this.adminCategoryService.updateCategory(
            adminId,
            updateCategoryDto,
            req
        );
    }

    @Post('delete-category')
    deleteCategory(@Req() req: Request, @Body() body?: any) {
        const id = body?.id;
        const adminId = (req as any)?.user.id;
        return this.adminCategoryService.deleteCategory(adminId, +id, req);
    }

    @Post('get-categories')
    getCategories(@Req() req: Request) {
        const adminId = (req as any)?.user.id;
        return this.adminCategoryService.getCategories(adminId);
    }

    @Post('get-deleted-categories')
    getDeleted(@Req() req: Request, @Body() dto: SearchCategoryDto) {
        const adminId = (req as any)?.user.id;
        return this.adminCategoryService.getDeleted(adminId, dto)
    }

    @Post('restore-category')
    restore(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminCategoryService.restore(adminId, id, req);
    }
}
