import { PrismaClient } from '@prisma/client'

const prismaConfig = {
  adapter: process.env.DATABASE_URL,
}

export const prisma = new PrismaClient(prismaConfig)
