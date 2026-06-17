import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService
  ){}

  async run() {
    await this.insertNewProducts();
    return 'SEED EXECUTED';
  }

  private async insertNewProducts(){
    this.productService.deleteAll();

    const products = initialData.products;

    await Promise.all(
      products.map(product => this.productService.create(product)),
    );
    return true;
  }
}
