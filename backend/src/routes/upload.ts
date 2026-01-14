import { Hono } from 'hono'
import { authMiddleware } from '@/middleware/auth'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export const uploadRoutes = new Hono()

// POST /api/upload - 이미지 업로드
uploadRoutes.post('/', authMiddleware, async (c) => {
  try {
    const auth = c.get('auth')

    // FormData에서 파일 가져오기
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FILE_REQUIRED',
            message: '파일이 필요합니다',
          },
        },
        400
      )
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: '이미지 파일만 업로드 가능합니다',
          },
        },
        400
      )
    }

    // 파일 크기 검증 (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: '파일 크기는 5MB 이하여야 합니다',
          },
        },
        400
      )
    }

    // 파일명 생성 (충돌 방지)
    const fileExt = file.name.split('.').pop()
    const fileName = `${auth.userId}/${nanoid()}.${fileExt}`

    // Supabase Storage에 업로드
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('guide-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return c.json(
        {
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: '이미지 업로드에 실패했습니다',
            details: error.message,
          },
        },
        500
      )
    }

    // 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from('guide-images')
      .getPublicUrl(data.path)

    return c.json({
      success: true,
      data: {
        url: publicUrlData.publicUrl,
        path: data.path,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '업로드 처리 중 오류가 발생했습니다',
        },
      },
      500
    )
  }
})
