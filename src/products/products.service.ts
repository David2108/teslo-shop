import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import {Repository} from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import {validate as isUUID} from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto) {
    
    try{

      // Crea el registro
      const product = this.productRepository.create(createProductDto);
      // Guarda en la base de datos
      await this.productRepository.save(product);

      return product;
    }catch(error){
      this.handleDBException(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    try{
      const {limit=10, offset=0} = paginationDto;
      return await this.productRepository.find({
        take: limit,
        skip: offset
      });
    }catch(error){
      this.handleDBException(error);
    }
  }

  async findOne(term: string) {
    let product: Product|null=null;
    try{
      if(isUUID(term)){
        product = await this.productRepository.findOneBy({id: term})
      }else{
        const queryBuilder = this.productRepository.createQueryBuilder();
        product = await queryBuilder.where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).getOne();
      }
      if(!product){
        throw new NotFoundException(`Product with id ${term} not found`);
      }
      return product;
    }catch(error){
      this.handleDBException(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    // Busca por el id y carga los valores de updateProductDto
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if(!product){
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    try{
      return await this.productRepository.save(product);
    }catch(error){
      this.handleDBException(error);
    }

  }

  async remove(id: string) {
    try{
      const product = await this.findOne(id);
      await this.productRepository.remove(product!);
    }catch(error){
      this.handleDBException(error);
    }
  }

  private handleDBException(error: any){
    if(error.code === '23505'){
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
