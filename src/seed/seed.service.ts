import { Injectable } from '@nestjs/common';
import { initialData } from './data/seed-data';
import { ProductsService } from '../products/products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async run() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'SEED EXECUTED';
  }

  private async deleteTables() {

    await this.productService.deleteAll();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();

  }

  private async insertUsers(){
    const seddUsers = initialData.users;
    const users: User[] = [];
    seddUsers.forEach(user => {
      const {password, ...userData} = user;
      const encriptPassword = bcrypt.hashSync(password, 10);
      users.push(this.userRepository.create({...userData, password: encriptPassword}));
    });
    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    this.productService.deleteAll();

    const products = initialData.products;

    await Promise.all(
      products.map(product => this.productService.create(product, user)),
    );
    return true;
  }
}
