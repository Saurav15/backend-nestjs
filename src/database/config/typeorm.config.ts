// typeorm.config.ts
/**
 * TypeORM configuration for the application.
 * Dynamically loads environment variables and configures database connection options.
 * Supports CLI usage for migrations and programmatic usage in the app.
 */
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Environment } from '../../common/enums';
import { config } from 'dotenv';

const envFile = `.env.${process.env.NODE_ENV || 'development'}.local`;
config({ path: envFile });

/**
 * Returns TypeORM DataSourceOptions based on environment variables.
 * @param configService NestJS ConfigService instance
 * @returns DataSourceOptions for TypeORM
 */
export const dataSourceConfig = (
  configService: ConfigService<EnvironmentVariables>,
): DataSourceOptions => {
  const isDevelopment =
    configService.get('NODE_ENV') === Environment.Development;

  return {
    type: 'postgres',
    host: configService.get('DB_HOST', { infer: true }),
    port: configService.get('DB_PORT', { infer: true }),
    username: configService.get('DB_USERNAME', { infer: true }),
    password: configService.get('DB_PASSWORD', { infer: true }),
    database: configService.get('DB_DATABASE', { infer: true }),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrationsRun: true,
    synchronize: false,
    logging: isDevelopment,
    // ...(isDevelopment ? {} : { ssl: { rejectUnauthorized: false } }),
  };
};

// For CLI operations (migrations, etc.)
import { EnvironmentVariables } from 'src/config/config.validation';

// Create ConfigService for CLI
const configService = new ConfigService<EnvironmentVariables>(
  process.env as unknown as EnvironmentVariables,
);

/**
 * TypeORM DataSource instance for CLI usage (migrations, etc.).
 */
export const AppDataSource = new DataSource(dataSourceConfig(configService));
