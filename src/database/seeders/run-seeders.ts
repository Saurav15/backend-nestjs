import { UserSeeder } from './user.seeder';
import { AppDataSource } from '../config/typeorm.config';

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
