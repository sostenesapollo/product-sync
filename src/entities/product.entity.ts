import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
@Index(['sku'], { unique: true })
@Index(['category'])
@Index(['brand'])
@Index(['price'])
export class Product {
    @ApiProperty({ description: 'Product ID' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Contentful entry ID' })
    @Column({ unique: true })
    contentfulId: string;

    @ApiProperty({ description: 'Product SKU' })
    @Column({ unique: true })
    sku: string;

    @ApiProperty({ description: 'Product name' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Product brand' })
    @Column()
    brand: string;

    @ApiProperty({ description: 'Product model' })
    @Column()
    model: string;

    @ApiProperty({ description: 'Product category' })
    @Column()
    category: string;

    @ApiProperty({ description: 'Product color' })
    @Column()
    color: string;

    @ApiProperty({ description: 'Product price', nullable: true })
    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    price: number | null;

    @ApiProperty({ description: 'Price currency', nullable: true })
    @Column('varchar', { nullable: true })
    currency: string | null;

    @ApiProperty({ description: 'Stock quantity' })
    @Column('int')
    stock: number;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn()
    updatedAt: Date;

    @ApiProperty({ description: 'Deletion date (soft delete)', nullable: true })
    @DeleteDateColumn()
    deletedAt: Date | null;

    @ApiProperty({ description: 'Contentful creation date' })
    @Column()
    contentfulCreatedAt: Date;

    @ApiProperty({ description: 'Contentful update date' })
    @Column()
    contentfulUpdatedAt: Date;

    @ApiProperty({ description: 'Last sync date from Contentful' })
    @Column()
    lastSyncAt: Date;
}
