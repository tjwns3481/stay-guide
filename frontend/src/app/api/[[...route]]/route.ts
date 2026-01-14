import { Hono } from 'hono'
import { handle } from 'hono/vercel'
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

const app = new Hono().basePath('/api')

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
app.route('/health', healthRoutes)
app.route('/guides', guideRoutes)
app.route('/guides', aiRoutes) // AI 라우트는 guides 하위에 마운트
app.route('/users', userRoutes)
app.route('/webhooks', webhookRoutes)
app.route('/licenses', licenseRoutes)

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

// Export handlers for Next.js API Routes
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
export const OPTIONS = handle(app)
