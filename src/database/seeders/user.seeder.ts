import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../../common/enums';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const userRepository = this.dataSource.getRepository(User);
    const users: Partial<User>[] = [];

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
  }
}
