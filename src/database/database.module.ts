/**
 * DatabaseModule configures and provides the TypeORM database connection for the application.
 *
 * Dependencies:
 * - TypeOrmModule: Registers and configures the database connection asynchronously.
 * - ConfigService: Supplies environment-based configuration for database connection options.
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentVariables } from 'src/config/config.validation';
import { dataSourceConfig } from './config/typeorm.config';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService<EnvironmentVariables>) =>
        dataSourceConfig(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
