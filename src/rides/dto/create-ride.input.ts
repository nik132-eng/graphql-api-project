import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

@InputType()
export class CreateRideInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  pickupLocation: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  dropoffLocation: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  estimatedFare: number;
}
