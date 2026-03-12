import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { SearchCategoryDto } from './dto/search-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>
    ) {}

    async findAll(dto: SearchCategoryDto): Promise<Category[]> {
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';
        const categories = this.categoryRepo
            .createQueryBuilder('category')
            .select([
                'category.id',
                'category.name',
                'category.displayOrder',
                'category.imageUrl',
                'category.bgImageUrl'
            ])
            .orderBy(`category.${dto.sortBy}`, direction)
            .getMany();

        return categories;
    }

    async getOne(id: number) {
        return await this.categoryRepo.findOne({
            where: { id },
            select: [
                'id',
                'name',
                'bgImageUrl'
            ]
        });
    }
}
