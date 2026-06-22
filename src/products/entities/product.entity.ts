import {BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import { ProductImage } from './product-image-entity';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

// Si se especifica el nombre en entity en la base de datos la tabla se creara
// con el nombre definido en @Entity y no con el nombre de la clase
@Entity({name: 'products'})
export class Product {
 
    @ApiProperty({
        example: '7139f6d-0444-4d05-ae33-ce7a532d3bef',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product Price'
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Aliquip non sint exercitation aliqua sint.',
        description: 'Product Description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't-shirt-teslo',
        description: 'Product Slug - for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'L', 'XL', 'XXL'],
        description: 'Product Sizes',
        default: []
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'men',
        description: 'Product Gender',
        default: 'men'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['shirt', 'pants'],
        description: 'Product Tags',
        default: []
    })
    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags: string[];

    @OneToMany(
        // Callback que dice que regresa un ProductImage
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];
    
    @ManyToMany(
        () => User,
        (user) => user.products,
        {eager: true}
    )
    user: User;

    @BeforeInsert()
    private checkSlugInster(){
        if(!this.slug){
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }

    @BeforeUpdate()
    private checkSlugUpdate(){
        this.slug = this.slug.toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }

}