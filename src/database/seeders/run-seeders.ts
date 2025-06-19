/**
 * Script to run all database seeders for initial data population.
 * Initializes the data source and executes each seeder.
 */
import { UserSeeder } from './user.seeder';
import { AppDataSource } from '../config/typeorm.config';

/**
 * Runs all seeders sequentially and closes the data source.
 */
async function runSeeders() {
  const dataSource = AppDataSource;
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  try {
    const userSeeder = new UserSeeder(dataSource);
    await userSeeder.run();
    console.log('All seeders completed successfully');
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeders();
