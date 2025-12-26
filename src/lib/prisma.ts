import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

// For serverless environments with Neon
neonConfig.fetchConnectionCache = true

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Check if we're using Neon (connection string contains neon.tech)
  const databaseUrl = process.env.DATABASE_URL || ''

  if (databaseUrl.includes('neon.tech') || databaseUrl.includes('neon.')) {
    // Use Neon serverless adapter to avoid prepared statement issues
    const pool = new Pool({ connectionString: databaseUrl })
    const adapter = new PrismaNeon(pool)
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }

  // For other databases, use standard client with reduced connections
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
