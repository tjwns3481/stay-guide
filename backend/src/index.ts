import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

// Routes
import { healthRoutes } from './routes/health'
import { guideRoutes } from './routes/guide'
import { userRoutes } from './routes/user'
import { webhookRoutes } from './routes/webhook'
import { aiRoutes } from './routes/ai'
import licenseRoutes from './routes/license'
import { uploadRoutes } from './routes/upload'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', secureHeaders())
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Routes
app.route('/api/health', healthRoutes)
app.route('/api/guides', guideRoutes)
app.route('/api/guides', aiRoutes) // AI 라우트는 guides 하위에 마운트
app.route('/api/users', userRoutes)
app.route('/api/webhooks', webhookRoutes)
app.route('/api/licenses', licenseRoutes)
app.route('/api/upload', uploadRoutes)

// Root
app.get('/', (c) => {
  return c.json({
    name: 'Roomy API',
    version: '0.1.0',
    status: 'running',
  })
})

// 404 Handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404)
})

// Error Handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`)
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    },
    500
  )
})

const port = parseInt(process.env.PORT || '8787')

console.log(`🚀 Roomy API Server running on http://localhost:${port}`)

// Export app for testing
export { app }

export default {
  port,
  fetch: app.fetch,
}
