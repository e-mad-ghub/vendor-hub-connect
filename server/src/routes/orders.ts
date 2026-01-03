import { Router } from 'express';
import { PrismaClient, OrderStatus, RequestStatus } from '@prisma/client';
import { authGuard } from '../utils/auth';

export function orderRouter(prisma: PrismaClient) {
  const router = Router();

  router.post('/', async (req, res) => {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ error: 'requestId required' });
    const request = await prisma.availabilityRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== RequestStatus.accepted) {
      return res.status(400).json({ error: 'Request not accepted' });
    }
    const order = await prisma.order.create({
      data: {
        vendorId: request.vendorId,
        requestId: request.id,
        total: request.quotedTotal || 0,
        status: OrderStatus.pending,
      },
    });
    res.json(order);
  });

  // Simulated Instapay charge endpoint
  router.post('/:id/pay/instapay', async (req, res) => {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: OrderStatus.paid, paymentRef: `IPN-${Date.now()}` },
    });
    res.json(order);
  });

  router.get('/vendor', authGuard(['vendor', 'admin']), async (req, res) => {
    const user = (req as any).user;
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.userId } });
    if (!vendor) return res.json([]);
    const orders = await prisma.order.findMany({ where: { vendorId: vendor.id }, orderBy: { createdAt: 'desc' } });
    res.json(orders);
  });

  return router;
}
