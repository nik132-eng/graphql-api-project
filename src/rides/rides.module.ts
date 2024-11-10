import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidesService } from './rides.service';
import { RidesResolver } from './rides.resolver';
import { Ride } from './entities/ride.entity';
import { User } from '../users/entities/user.entity';
import { WebsocketsModule } from '../websockets/websockets.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride, User]),
    WebsocketsModule,
    UsersModule
  ],
  providers: [RidesService, RidesResolver],
})
export class RidesModule {}