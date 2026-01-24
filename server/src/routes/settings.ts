import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../utils/auth';
import { z } from 'zod';

const updateSchema = z.object({
  phoneNumber: z.string().min(5),
  messageTemplate: z.string().min(5),
});

export function settingsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get('/whatsapp', async (_req, res) => {
    const settings = await prisma.whatsAppSettings.findFirst();
    if (!settings) {
      return res.json({ phoneNumber: '', messageTemplate: '' });
    }
    res.json({ phoneNumber: settings.phoneNumber, messageTemplate: settings.messageTemplate });
  });

  router.put('/whatsapp', authGuard(['admin']), async (req, res) => {
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { phoneNumber, messageTemplate } = parse.data;

    const existing = await prisma.whatsAppSettings.findFirst();
    const settings = existing
      ? await prisma.whatsAppSettings.update({
          where: { id: existing.id },
          data: { phoneNumber, messageTemplate },
        })
      : await prisma.whatsAppSettings.create({
          data: { phoneNumber, messageTemplate },
        });

    res.json({ phoneNumber: settings.phoneNumber, messageTemplate: settings.messageTemplate });
  });

  return router;
}
