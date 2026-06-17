import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image-entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSouce: DataSource
  ) { }

  async create(createProductDto: CreateProductDto) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      // Crea el registro
      const product = this.productRepository.create({
        ...productDetails,
        // Al crear la imagen dentro de la creación del producto, al crear el producto
        // crea las imagenes y le asigna a cada imagen el id del producto
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });

      // Guarda en la base de datos los datos de productos y de las images
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBException(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        //Relations
        relations: {
          images: true
        }
      });
      return products.map(product => ({
        ...product,
        images: product.images?.map(image => image.url)
      }))
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findOne(term: string) {
    let product: Product | null = null;
    try {
      if (isUUID(term)) {
        // Los datos de las tablas relacionadas se cargan automaticamente para todos los métodos
        // find que usean eager
        product = await this.productRepository.findOneBy({ id: term })
      } else {
        const queryBuilder = this.productRepository.createQueryBuilder('prod');
        product = await queryBuilder.where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
          // Se usa para cargar los datos de las tablas relacionadas
          .leftJoinAndSelect('prod.images', 'prodImages')
          .getOne();
      }
      if (!product) {
        throw new NotFoundException(`Product with id ${term} not found`);
      }
      return product;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findOnePlain(term: string) {
    const product = await this.findOne(term);
    return {
      ...product,
      images: product?.images?.map(image => image.url)
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    // Busca por el id y carga los valores de updateProductDto
    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate
    });

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    // Create Query Runner
    // Cuando se utiliza queryrunner.manager no impacta inmediatamente en el base de datos
    const queryRunner = this.dataSouce.createQueryRunner();
    await queryRunner.connect(); // Realiza la conección con la base de datos
    await queryRunner.startTransaction(); // Inicia la transacción

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: { id }
        });
        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      }

      await queryRunner.manager.save(product);

      // Confirma los cambios e impacta en la base de datos
      await queryRunner.commitTransaction();
      // Libera el queryRunner
      await queryRunner.release();

      //return await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {

      // Revierte los cambios
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBException(error);
    }

  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      await this.productRepository.remove(product!);
    } catch (error) {
      this.handleDBException(error);
    }
  }

  private handleDBException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAll(){
    const query = this.productRepository.createQueryBuilder('product');
    try{
      return await query.delete().where({}).execute();
    }catch(error){
      this.handleDBException(error);
    }

  }
}
