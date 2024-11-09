import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';

async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([AppModule]);

  writeFileSync('src/schema.gql', schema.toString());
}

generateSchema();