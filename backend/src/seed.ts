import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './users/user.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'admin',
    password: 'password',
    database: 'drug_testing',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  await dataSource.initialize();
  const userRepository = dataSource.getRepository(User);
  const BCRYPT_ROUNDS = 12;

  // Read from environment variables, fallback to defaults
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fmda.ca';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'Admin@123!';

  console.log('Seeding database...\n');

  // Check using the dynamic email
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Database already seeded — skipping');
    await dataSource.destroy();
    return;
  }

  // 1. Admin User
  const adminPassword = await bcrypt.hash(adminPass, BCRYPT_ROUNDS);

  const admin = userRepository.create({
    email: adminEmail,
    passwordHash: adminPassword,
    firstName: 'System',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    permissions: {},
    isActive: true,
    registrationNumber: 'ADMIN001',
  });

  await userRepository.save(admin);

  console.log(` Admin: ${admin.email}`);
  console.log('\nSeeding complete!');
  console.log(`Admin login: ${adminEmail} / [HIDDEN]`);

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
