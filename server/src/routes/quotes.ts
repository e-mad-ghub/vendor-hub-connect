import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../utils/auth';
import { z } from 'zod';

const createSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(5),
  message: z.string().min(5),
  items: z.array(z.object({
    productId: z.string(),
    title: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
    image: z.string(),
  })).min(1),
});

export function quoteRouter(prisma: PrismaClient) {
  const router = Router();

  router.post('/', async (req, res) => {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { customerName, customerPhone, message, items } = parse.data;
    const request = await prisma.quoteRequest.create({
      data: {
        customerName,
        customerPhone,
        message,
        items: {
          create: items.map((i) => ({
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

  router.get('/', authGuard(['admin']), async (_req, res) => {
    const requests = await prisma.quoteRequest.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  });

  return router;
}
