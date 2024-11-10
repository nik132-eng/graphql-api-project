import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';
import { CreateRideInput } from './dto/create-ride.input';
import { User } from 'users/entities/user.entity';

@Resolver(() => Ride)
export class RidesResolver {
  private pubSub: PubSub;

  constructor(private ridesService: RidesService) {
    this.pubSub = new PubSub();
  }

  @Mutation(() => Ride)
  @UseGuards(JwtAuthGuard)
  async createRide(
    @CurrentUser() user: User,
    @Args('createRideInput') createRideInput: CreateRideInput
  ): Promise<Ride> {
    // Add detailed logging
    console.log("Creating ride with user:", {
      userId: user.userId,
      userEmail: user.email,
      input: createRideInput
    });

    if (!user || !user.userId) {
      throw new Error('User not authenticated or invalid user data');
    }

    const ride = await this.ridesService.createRide(user, createRideInput);
    await this.pubSub.publish('rideRequested', { rideRequested: ride });
    return ride;
  }

  @Query(() => [Ride])
  @UseGuards(JwtAuthGuard)
  async myRides(@CurrentUser() user: User): Promise<Ride[]> {
    return this.ridesService.findUserRides(user.id);
  }

  @Subscription(() => Ride)
  @UseGuards(JwtAuthGuard)
  rideUpdated() {
    return this.pubSub.asyncIterator('rideUpdated');
  }
}
