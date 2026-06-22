import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de prefix global
  app.setGlobalPrefix('api');

  // Configuración de pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  // Configuración Swagger
  const config = new DocumentBuilder()
  .setTitle('Teslo RESTFul API')
  .setDescription('Tesloshop endpoints')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
