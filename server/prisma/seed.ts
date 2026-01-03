import { PrismaClient, UserRole, VendorStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@marketplace.com';
  const sellerEmail = 'techhub@vendor.com';
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

  let seller = await prisma.user.findUnique({ where: { email: sellerEmail } });
  if (!seller) {
    seller = await prisma.user.create({
      data: {
        id: 'u_seller',
        email: sellerEmail,
        name: 'Main Seller',
        password,
        role: UserRole.vendor,
      },
    });
  }

  let vendor = await prisma.vendor.findFirst({ where: { userId: seller.id } });
  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        id: 'v1',
        userId: seller.id,
        storeName: 'التاجر الرئيسي',
        description: 'كل المنتجات بتتباع من تاجر واحد معتمد.',
        logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop',
        banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=300&fit=crop',
        status: VendorStatus.approved,
      },
    });
  }

  console.log('Seeded users and vendor', { admin: admin.email, seller: seller.email, vendor: vendor.storeName });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
