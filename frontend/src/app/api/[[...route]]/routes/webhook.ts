import { Hono } from 'hono'
import { Webhook } from 'svix'
import { prisma } from '@/lib/server/prisma'

const webhookRoutes = new Hono()

// Clerk Webhook Event Types
interface ClerkUserEventData {
  id: string
  email_addresses: Array<{
    id: string
    email_address: string
  }>
  primary_email_address_id: string
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

interface ClerkWebhookEvent {
  type: string
  data: ClerkUserEventData
}

/**
 * POST /api/webhooks/clerk
 * Clerk 웹훅 핸들러 - 사용자 생성/업데이트/삭제 동기화
 */
webhookRoutes.post('/clerk', async (c) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return c.json(
      {
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Webhook secret not configured',
        },
      },
      500
    )
  }

  // Svix 헤더 추출
  const svixId = c.req.header('svix-id')
  const svixTimestamp = c.req.header('svix-timestamp')
  const svixSignature = c.req.header('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INVALID_HEADERS',
          message: 'Missing svix headers',
        },
      },
      400
    )
  }

  // Raw body 가져오기
  const body = await c.req.text()

  // Webhook 서명 검증
  const wh = new Webhook(webhookSecret)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return c.json(
      {
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Webhook signature verification failed',
        },
      },
      400
    )
  }

  const { type, data } = event

  try {
    switch (type) {
      case 'user.created': {
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id
        )

        if (!primaryEmail) {
          console.error('No primary email found for user:', data.id)
          break
        }

        const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || null

        await prisma.user.create({
          data: {
            clerkId: data.id,
            email: primaryEmail.email_address,
            name,
            imageUrl: data.image_url,
          },
        })

        console.log('User created:', data.id)
        break
      }

      case 'user.updated': {
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id
        )

        if (!primaryEmail) {
          console.error('No primary email found for user:', data.id)
          break
        }

        const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || null

        await prisma.user.upsert({
          where: { clerkId: data.id },
          update: {
            email: primaryEmail.email_address,
            name,
            imageUrl: data.image_url,
          },
          create: {
            clerkId: data.id,
            email: primaryEmail.email_address,
            name,
            imageUrl: data.image_url,
          },
        })

        console.log('User updated:', data.id)
        break
      }

      case 'user.deleted': {
        await prisma.user.deleteMany({
          where: { clerkId: data.id },
        })

        console.log('User deleted:', data.id)
        break
      }

      default:
        console.log('Unhandled webhook event type:', type)
    }

    return c.json({
      success: true,
      data: {
        received: true,
        type,
      },
    })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return c.json(
      {
        success: false,
        error: {
          code: 'HANDLER_ERROR',
          message: 'Failed to process webhook',
        },
      },
      500
    )
  }
})

export { webhookRoutes }
