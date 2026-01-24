import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@marketplace.com';
  const password = await bcrypt.hash('password', 10);

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password,
        role: UserRole.admin,
      },
    });
  }

  const existingSettings = await prisma.whatsAppSettings.findFirst();
  if (!existingSettings) {
    await prisma.whatsAppSettings.create({
      data: {
        phoneNumber: '201000000000',
        messageTemplate: 'Hello, my name is [Customer Name]. I would like a quote for the following items:\\n[Items]\\nPlease confirm price and availability. Thank you.',
      },
    });
  }

  console.log('Seeded admin and WhatsApp settings', { admin: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
