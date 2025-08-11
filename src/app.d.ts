// src/app.d.ts
import type { PrismaClient, User } from '@prisma/client';

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      prisma: PrismaClient;
    }
    interface PageData {
      user?: User | null;
      flash?: { type: 'success' | 'error'; message: string };
    }
  }
}

export {};
