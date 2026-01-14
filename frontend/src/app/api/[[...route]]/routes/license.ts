import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as licenseService from '../services/license'

const license = new Hono()

// POST /api/licenses/verify - 키 형식만 검증
license.post('/verify', async (c) => {
  try {
    const body = await c.req.json()
    const { licenseKey } = body

    if (!licenseKey) {
      return c.json({ error: 'License key is required' }, 400)
    }

    const result = licenseService.verifyLicenseKey(licenseKey)
    return c.json(result)
  } catch (error) {
    console.error('Verify license error:', error)
    return c.json({ error: 'Failed to verify license key' }, 500)
  }
})

// POST /api/licenses/activate - 키 활성화 (인증 필요)
license.post('/activate', authMiddleware, async (c) => {
  try {
    const auth = c.get('auth')
    const body = await c.req.json()
    const { licenseKey } = body

    if (!licenseKey) {
      return c.json({ error: 'License key is required' }, 400)
    }

    const activatedLicense = await licenseService.activateLicense(auth.userId, licenseKey)
    return c.json({ success: true, license: activatedLicense })
  } catch (error: any) {
    console.error('Activate license error:', error)

    if (error.message === 'INVALID_KEY_FORMAT') {
      return c.json({ error: 'Invalid license key format' }, 400)
    }
    if (error.message === 'KEY_ALREADY_USED') {
      return c.json({ error: 'License key already in use' }, 409)
    }
    return c.json({ error: 'Failed to activate license' }, 500)
  }
})

// GET /api/licenses/me - 현재 라이선스 조회 (인증 필요)
license.get('/me', authMiddleware, async (c) => {
  try {
    const auth = c.get('auth')
    const currentLicense = await licenseService.getCurrentLicense(auth.userId)

    if (!currentLicense) {
      return c.json({
        plan: 'free',
        status: 'active',
        features: licenseService.getPlanFeatures('free'),
        expiresAt: null,
      })
    }

    return c.json(currentLicense)
  } catch (error) {
    console.error('Get license error:', error)
    return c.json({ error: 'Failed to retrieve license' }, 500)
  }
})

export default license
