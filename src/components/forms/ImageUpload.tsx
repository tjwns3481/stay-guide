/**
 * ImageUpload Component
 * 이미지 업로드 컴포넌트
 */

'use client';

import { useState, useCallback } from 'react';
import { validateImageFile } from '@/lib/utils/upload';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  className?: string;
}

export function ImageUpload({ onUpload, currentImage, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!validateImageFile(file)) {
      setError('유효하지 않은 파일입니다. 이미지 파일(JPEG, PNG, WebP, GIF)만 업로드 가능하며, 최대 5MB까지 지원합니다.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || '업로드에 실패했습니다');
      }

      const result = await response.json();
      onUpload(result.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [currentImage, onUpload]);

  return (
    <div className={className}>
      <div className="relative">
        {/* Preview Area */}
        <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
          {preview ? (
            <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-sm">업로드 중... {progress}%</div>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
              <svg
                className="w-12 h-12 text-muted-foreground mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-muted-foreground">
                클릭하여 이미지를 선택하세요
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP, GIF (최대 5MB)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-2">
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Change Button */}
        {preview && !isUploading && (
          <label className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            이미지 변경
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
