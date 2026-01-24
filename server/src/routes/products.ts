import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../utils/auth';
import { ensureStorageDir, storageDir } from '../utils/storage';
import path from 'path';
import fs from 'fs';

export function productRouter(prisma: PrismaClient, upload: any) {
  const router = Router();

  router.get('/', async (_req, res) => {
    const products = await prisma.product.findMany({
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  });

  router.post('/', authGuard(['admin']), upload.single('image'), async (req, res) => {
    try {
      const { title, description, price, stock, category } = req.body;
      if (!title || !price || !category) return res.status(400).json({ error: 'Missing fields' });
      let imageUrl = req.body.imageUrl || '';
      if (req.file) {
        const dest = ensureStorageDir();
        const filename = `${Date.now()}-${req.file.originalname}`;
        const fullPath = path.join(dest, filename);
        fs.renameSync(req.file.path, fullPath);
        imageUrl = `/uploads/${filename}`;
      }

      const product = await prisma.product.create({
        data: {
          title,
          description: description || '',
          price: Number(price),
          stock: Number(stock || 0),
          category,
          images: imageUrl ? { create: [{ url: imageUrl }] } : undefined,
        },
        include: { images: true },
      });

      res.json(product);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  return router;
}
