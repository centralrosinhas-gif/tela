import { PrismaClient } from '@prisma/client'

const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}

export const prisma = new PrismaClient(prismaConfig)
