import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity()
export class Ride {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'passengerId' })
  passenger: User;

  @Column({ nullable: false })
  passengerId: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver: User;

  @Column({ nullable: true })
  driverId?: string;

  @Field()
  @Column()
  pickupLocation: string;

  @Field()
  @Column()
  dropoffLocation: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  estimatedFare: number;

  @Field()
  @Column({
    type: 'enum',
    enum: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'REQUESTED'
  })
  status: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}