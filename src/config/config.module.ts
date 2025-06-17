import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { EnvironmentVariables } from './config.validation';
import { validateSync } from 'class-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
      validate: (config) => {
        const validatedConfig = plainToClass(EnvironmentVariables, config, {
          enableImplicitConversion: true,
        });
        const errors = validateSync(validatedConfig);
        if (errors.length > 0) {
          throw new Error(errors.toString());
        }
        return validatedConfig;
      },
      cache: true,
    }),
  ],
})
export class ConfigurationModule {}
