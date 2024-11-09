import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting NestJS application...');
  
  const app = await NestFactory.create(AppModule);  
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  if (configService.get('CORS_ENABLED')) {
    app.enableCors({
      origin: configService.get('CORS_ORIGIN'),
      credentials: true,
    });
    console.log('CORS enabled');
  }

  const port = configService.get('PORT');
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`GraphQL Playground available at: http://localhost:${port}/graphql`);
}
bootstrap().catch(err => {
  console.error('Error starting the application:', err);
  process.exit(1);
});