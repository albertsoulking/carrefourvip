import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entity/products.entity';
import { Repository } from 'typeorm';
import { UtilityService } from 'src/utility/utility.service';
import { SearchProductDto } from './dto/search-product.dto';
import { Request } from 'express';
import { IpService } from 'src/ip/ip.service';
import { ExchangeRate } from 'src/exchange/entity/exchange.entity';
import { Favorite } from 'src/favorites/entity/favorites.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepo: Repository<Product>,
        @InjectRepository(ExchangeRate)
        private readonly exchangeRepo: Repository<ExchangeRate>,
        private readonly utilityService: UtilityService,
        private readonly ipService: IpService
    ) {}

    async findAllProducts(
        req: Request,
        dto: SearchProductDto
    ): Promise<{
        data: Product[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const skip = (dto.page - 1) * dto.limit;

        const query = this.productsRepo
            .createQueryBuilder('product')
            .where('product.isAvailable = true')
            .leftJoin('product.category', 'category')
            .leftJoin('product.favorites', 'favorite')
            .leftJoin('favorite.user', 'user')
            .select([
                'product.id',
                'product.imageUrl',
                'product.name',
                'product.price',
                'product.attributes',
                'product.attrGroups',
                'category.id',
                'category.name',
                'favorite.id',
                'user.id'
            ]);

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (dto.categoryId) {
            query.andWhere('category.id = :categoryId', {
                categoryId: dto.categoryId
            });
        }

        let productTotal = 0;
        let productData: any = [];

        if (dto.isRandom === 1) {
            const [data, total] = await query
                .skip(skip)
                .orderBy('RAND()')
                .take(dto.limit)
                .getManyAndCount();
            productData = data;
            productTotal = total;
        } else {
            if (dto.query) {
                const translatedKeyword =
                    await this.utilityService.translateToEnglish(dto.query);

                query.andWhere('product.name LIKE :kw', {
                    kw: `%${translatedKeyword}%`
                });
            }
            const [data, total] = await query
                .skip(skip)
                .take(dto.limit)
                .orderBy(`product.${dto.sortBy}`, direction)
                .getManyAndCount();

            productData = data;
            productTotal = total;
        }

        const geoInfo = await this.ipService.getGeoInfoByIp(req);
        const exRate = await this.exchangeRepo.findOneBy({
            fromCurrency: 'EUR',
            toCurrency: geoInfo?.currency ?? 'EUR'
        });

        const rawData = await Promise.all(
            productData.map(async (product: Product) => {
                const isFavorite =
                    !!dto.userId &&
                    product.favorites?.some(
                        (fav: Favorite) => fav.user?.id === Number(dto.userId)
                    );

                let convertedPrices = Number(product.price);
                if (exRate) {
                    convertedPrices *= Number(exRate.rate);
                }

                return {
                    ...product,
                    isFavorite
                    // convertedPrices
                };
            })
        );

        const products = {
            data: rawData,
            total: productTotal,
            page: dto.page,
            lastPage: Math.ceil(productTotal / dto.limit)
        };

        return products;
    }

    async findOneProduct(
        id: number,
        userId?: number
    ): Promise<Product & { isFavorite: boolean; similarProducts: Product[] }> {
        const product = await this.productsRepo
            .createQueryBuilder('product')
            .leftJoin('product.category', 'category')
            .leftJoin('product.favorites', 'favorite')
            .leftJoin('favorite.user', 'user')
            .select([
                'product.id',
                'product.name',
                'product.description',
                'product.price',
                'product.imageUrl',
                'product.imageList',
                'product.attributes',
                'product.attrGroups',
                'category.id',
                'category.name',
                'favorite.id',
                'user.id'
            ])
            .where('product.id = :id', { id })
            .getOne();

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        // 判断是否当前用户收藏了这个商品
        const isFavorite =
            !!userId &&
            product.favorites?.some((fav) => fav.user?.id === userId);

        return {
            ...product,
            isFavorite,
            similarProducts: await this.findSimilarProductsRandom(id, userId)
        };
    }

    async findSimilarProductsRandom(
        productId: number,
        userId?: number
    ): Promise<(Product & { isFavorite: boolean })[]> {
        const currentProduct = await this.productsRepo.findOne({
            where: { id: productId },
            relations: ['category']
        });

        if (!currentProduct?.category) {
            throw new NotFoundException('Product or its category not found');
        }

        // 查找同分类下的其他商品（随机排序）
        const products = await this.productsRepo
            .createQueryBuilder('product')
            .leftJoin('product.category', 'category')
            .leftJoin(
                'product.favorites',
                'favorite',
                userId ? 'favorite.userId = :userId' : '1=0',
                { userId }
            )
            .select([
                'product.id',
                'product.name',
                'product.imageUrl',
                'product.price',
                'favorite.id',
                'category.id',
                'category.name'
            ])
            .where('category.id = :categoryId', {
                categoryId: currentProduct.category.id
            })
            .andWhere('product.id != :productId', { productId })
            .orderBy('RAND()')
            .limit(10)
            .getMany();

        // 返回带 isFavorite 的结构
        return products.map((product) => ({
            ...product,
            isFavorite:
                !!userId &&
                product.favorites?.some((fav) => fav.user?.id === userId)
        }));
    }
}
