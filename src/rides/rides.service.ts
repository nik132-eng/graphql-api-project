import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride } from './entities/ride.entity';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { CreateRideInput } from './dto/create-ride.input';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly ridesRepository: Repository<Ride>,
    private readonly websocketsGateway: WebsocketsGateway
  ) {}

  async createRide(user: User, createRideInput: CreateRideInput): Promise<Ride> {
    try {
      const { pickupLocation, dropoffLocation, estimatedFare } = createRideInput;
  
      if (!pickupLocation || !dropoffLocation || estimatedFare === undefined) {
        throw new BadRequestException('Missing required fields: pickupLocation, dropoffLocation, or estimatedFare');
      }

      if (!user || !user.userId) {
        throw new BadRequestException('Invalid user data');
      }
  
      // Create the ride with explicit passengerId
      const ride = this.ridesRepository.create({
        pickupLocation,
        dropoffLocation,
        estimatedFare,
        status: 'REQUESTED',
        passengerId: user.userId
      });
  
      // Save the ride
      const savedRide = await this.ridesRepository.save(ride);
  
      // Load the full ride with passenger relationship
      const fullRide = await this.ridesRepository.findOne({
        where: { id: savedRide.id },
        relations: ['passenger']
      });
  
      // Notify nearby drivers
      await this.websocketsGateway.notifyNearbyDrivers(fullRide);
  
      return fullRide;
    } catch (error) {
      console.error('Create ride error:', error);
      throw new BadRequestException('Failed to create ride: ' + error.message);
    }
  }
  
  async findUserRides(userId: string): Promise<Ride[]> {
    try {
      const rides = await this.ridesRepository.find({
        where: { passenger: { id: userId } },
        relations: ['passenger'],
      });
      return rides;
    } catch (error) {
      throw new NotFoundException('User rides not found', error.message);
    }
  }

  async updateRideStatus(rideId: string, status: string): Promise<Ride> {
    const validStatuses = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    // Validate the status
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const ride = await this.ridesRepository.findOne({ where: { id: rideId } });
    if (!ride) {
      throw new NotFoundException(`Ride with ID ${rideId} not found`);
    }

    try {
      ride.status = status;
      const updatedRide = await this.ridesRepository.save(ride);
      await this.websocketsGateway.notifyRideUpdate(updatedRide);
      return updatedRide;
    } catch (error) {
      throw new BadRequestException('Failed to update ride status', error.message);
    }
  }

  async deleteRide(rideId: string): Promise<boolean> {
    const ride = await this.ridesRepository.findOne({ where: { id: rideId } });
    if (!ride) {
      throw new NotFoundException(`Ride with ID ${rideId} not found`);
    }

    try {
      await this.ridesRepository.remove(ride);
      return true;
    } catch (error) {
      throw new BadRequestException('Failed to delete ride', error.message);
    }
  }
}
