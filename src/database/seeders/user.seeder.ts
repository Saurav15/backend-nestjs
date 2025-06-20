/**
 * Seeder for populating the database with sample users (admins, editors, viewers).
 */
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

export class UserSeeder {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Runs the user seeder: creates and saves sample users of all roles.
   */
  async run() {
    try {
      const userRepository = this.dataSource.getRepository(User);

      // Check if seeder has already run (by looking for the static admin user)
      const existingAdmin = await userRepository.findOne({
        where: { email: 'admin@example.com' },
      });

      if (existingAdmin) {
        console.log('✅ Seeder has already run. Skipping user seeding.');
        return;
      }

      // Static users to be shared in README
      const staticUsers: Partial<User>[] = [
        {
          email: 'admin@example.com',
          fullName: 'Admin User',
          password: await bcrypt.hash('Admin@123', 10),
          role: UserRole.Admin,
        },
        {
          email: 'editor@example.com',
          fullName: 'Editor User',
          password: await bcrypt.hash('Editor@123', 10),
          role: UserRole.Editor,
        },
        {
          email: 'viewer@example.com',
          fullName: 'Viewer User',
          password: await bcrypt.hash('Viewer@123', 10),
          role: UserRole.Viewer,
        },
      ];

      const users: Partial<User>[] = [...staticUsers];

      // Generate 10 admins
      for (let i = 0; i < 10; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        users.push({
          email: faker.internet.email({ firstName, lastName }),
          fullName: `${firstName} ${lastName}`,
          password: await bcrypt.hash('Admin@123', 10),
          role: UserRole.Admin,
        });
      }

      // Generate 200 editors
      for (let i = 0; i < 200; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        users.push({
          email: faker.internet.email({ firstName, lastName }),
          fullName: `${firstName} ${lastName}`,
          password: await bcrypt.hash('Editor@123', 10),
          role: UserRole.Editor,
        });
      }

      // Generate 790 viewers
      for (let i = 0; i < 790; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        users.push({
          email: faker.internet.email({ firstName, lastName }),
          fullName: `${firstName} ${lastName}`,
          password: await bcrypt.hash('Viewer@123', 10),
          role: UserRole.Viewer,
        });
      }

      // Save all users
      await userRepository.save(users);
      console.log('✅ Users seeded successfully');
    } catch (error) {
      console.error('❌ Error during user seeding:', error);
    }
  }
}
