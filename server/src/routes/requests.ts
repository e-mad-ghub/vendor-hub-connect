import { Router } from 'express';
import { PrismaClient, RequestStatus } from '@prisma/client';
import { authGuard } from '../utils/auth';
import { z } from 'zod';

const createSchema = z.object({
  vendorId: z.string(),
  buyerPhone: z.string().min(3),
  cartSignature: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    title: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
    image: z.string(),
  })),
});

export function requestRouter(prisma: PrismaClient) {
  const router = Router();

  router.post('/', async (req, res) => {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { vendorId, buyerPhone, cartSignature, items } = parse.data;
    const request = await prisma.availabilityRequest.create({
      data: {
        vendorId,
        buyerPhone,
        cartSignature,
        items: {
          create: items.map(i => ({
            productId: i.productId,
            title: i.title,
            quantity: i.quantity,
            price: i.price,
            image: i.image,
          })),
        },
      },
      include: { items: true },
    });
    res.json(request);
  });

  router.get('/by-phone/:phone', async (req, res) => {
    const phone = req.params.phone;
    const requests = await prisma.availabilityRequest.findMany({
      where: { buyerPhone: phone },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  });

  router.get('/vendor', authGuard(['vendor', 'admin']), async (req, res) => {
    const user = (req as any).user;
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.userId } });
    if (!vendor) return res.json([]);
    const requests = await prisma.availabilityRequest.findMany({
      where: { vendorId: vendor.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  });

  router.patch('/:id/quote', authGuard(['vendor', 'admin']), async (req, res) => {
    const { quotedTotal, sellerNote } = req.body;
    const request = await prisma.availabilityRequest.update({
      where: { id: req.params.id },
      data: { status: RequestStatus.quoted, quotedTotal: Number(quotedTotal), sellerNote, updatedAt: new Date() },
      include: { items: true },
    });
    res.json(request);
  });

  router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!Object.values(RequestStatus).includes(status)) return res.status(400).json({ error: 'Bad status' });
    const request = await prisma.availabilityRequest.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true },
    });
    res.json(request);
  });

  return router;
}
