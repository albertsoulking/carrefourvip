import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Category } from './entities/category.entity';
import { SearchCategoryDto } from './dto/search-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post('get-all-categories')
    @ApiOperation({ summary: 'Get all categories' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns all categories',
        type: [Category]
    })
    findAll(@Body() dto: SearchCategoryDto) {
        return this.categoriesService.findAll(dto);
    }
    
    @Post('get-one-category')
    getOne(@Body('id') id: number) {
        return this.categoriesService.getOne(id);
    }
}
