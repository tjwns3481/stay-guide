import { Hono } from 'hono'

export const healthRoutes = new Hono()

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

healthRoutes.get('/ready', (c) => {
  // TODO: Add database connection check
  return c.json({
    status: 'ready',
    services: {
      database: 'connected',
      cache: 'connected',
    },
  })
})
