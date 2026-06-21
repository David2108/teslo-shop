import {BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import { ProductImage } from './product-image-entity';
import { User } from '../../auth/entities/user.entity';

// Si se especifica el nombre en entity en la base de datos la tabla se creara
// con el nombre definido en @Entity y no con el nombre de la clase
@Entity({name: 'products'})
export class Product {
 
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

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