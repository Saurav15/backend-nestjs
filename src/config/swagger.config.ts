import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('JK-Tech-Nestjs-Assignment')
  .setDescription('API documentation for JK Tech NestJS assignment')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
