/**
 * Upload API Route
 * 이미지 업로드 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { validateImageFile, generateUniqueFilename } from '@/lib/utils/upload';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { message: '파일이 필요합니다' } },
        { status: 400 }
      );
    }

    // Validate file
    if (!validateImageFile(file)) {
      return NextResponse.json(
        { error: { message: '유효하지 않은 파일입니다. 이미지 파일(JPEG, PNG, WebP, GIF)만 업로드 가능하며, 최대 5MB까지 지원합니다.' } },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const path = `uploads/${userId}/${filename}`;

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: { message: '업로드에 실패했습니다' } },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return NextResponse.json({
      data: {
        path: data.path,
        url: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: { message: '업로드 중 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
