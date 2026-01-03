import './loadEnv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth';
import { productRouter } from './routes/products';
import { requestRouter } from './routes/requests';
import { orderRouter } from './routes/orders';
import { storageDir } from './utils/storage';

const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: storageDir });

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(storageDir)));

app.use('/api/auth', authRouter(prisma));
app.use('/api/products', productRouter(prisma, upload));
app.use('/api/requests', requestRouter(prisma));
app.use('/api/orders', orderRouter(prisma));

const port = Number(process.env.API_PORT || 4000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
