import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configure CSP for GraphQL Playground
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': [`'self'`],
          'script-src': [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`, 'cdn.jsdelivr.net'],
          'style-src': [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
          'font-src': [`'self'`, 'fonts.gstatic.com'],
          'img-src': [`'self'`, 'data:', 'cdn.jsdelivr.net'],
          'connect-src': [`'self'`]
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  if (configService.get('CORS_ENABLED')) {
    app.enableCors({
      origin: configService.get('CORS_ORIGIN'),
      credentials: true,
    });
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