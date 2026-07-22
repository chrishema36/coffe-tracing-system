import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app';

dotenv.config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL Database via Prisma');

    const app = createApp(prisma);

    app.listen(PORT, () => {
      console.log(`🚀 Coffee Tracing Backend Server running on http://localhost:${PORT}`);
      console.log(`📘 Interactive Swagger API Docs available at http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
