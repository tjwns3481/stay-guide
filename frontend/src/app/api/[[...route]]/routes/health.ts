import { Hono } from 'hono'
import { prisma } from '@/lib/server/prisma'

export const healthRoutes = new Hono()

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

healthRoutes.get('/ready', async (c) => {
  // Database connection check
  let databaseStatus = 'disconnected'
  let databaseError: string | null = null

  try {
    // Simple query to check database connection
    await prisma.$queryRaw`SELECT 1`
    databaseStatus = 'connected'
  } catch (error) {
    console.error('Database health check failed:', error)
    databaseError = error instanceof Error ? error.message : 'Unknown error'
  }

  const isReady = databaseStatus === 'connected'

  return c.json(
    {
      status: isReady ? 'ready' : 'not_ready',
      services: {
        database: databaseStatus,
        ...(databaseError && { databaseError }),
      },
    },
    isReady ? 200 : 503
  )
})
