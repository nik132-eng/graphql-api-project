import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpAdapterHost } from '@nestjs/core';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { UsersModule } from './users/users.module';
import configuration from './config/configuration';
import { AppResolver } from './app.resolver';

@Module({
  providers: [AppResolver],
})

@Module({
  imports: [
    // Global ConfigModule
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // TypeORM Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {    
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    
    // GraphQL Module with HttpAdapterHost
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
        httpAdapterHost: HttpAdapterHost,
      ) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get('GRAPHQL_PLAYGROUND'),
        debug: configService.get('GRAPHQL_DEBUG'),
        context: ({ req }) => ({ req }),
        path: '/graphql',
        // Include httpAdapter from the host
        httpAdapter: httpAdapterHost?.httpAdapter,
      }),
      inject: [ConfigService, HttpAdapterHost],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    WebsocketsModule,
  ],
})
export class AppModule {}