// Single shared PrismaClient instance.
// In dev, Next.js hot-reload can re-import modules many times; caching the
// client on globalThis avoids exhausting database connections.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
