/**
 * GuidebookForm Component
 * 가이드북 생성/수정 폼
 */

'use client';

import { useState } from 'react';

interface GuidebookFormData {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
}

interface GuidebookFormProps {
  initialData?: Partial<GuidebookFormData>;
  onSubmit: (data: GuidebookFormData) => Promise<void>;
  isLoading?: boolean;
}

export function GuidebookForm({
  initialData,
  onSubmit,
  isLoading,
}: GuidebookFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, slug, description });
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData?.slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 제목 */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground mb-2"
        >
          제목
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={handleTitleChange}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="가이드북 제목을 입력하세요"
          required
        />
      </div>

      {/* 슬러그 */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-foreground mb-2"
        >
          슬러그 (URL)
        </label>
        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">/g/</span>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="url-slug"
            required
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          영문, 숫자, 하이픈만 사용 가능합니다.
        </p>
      </div>

      {/* 설명 */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground mb-2"
        >
          설명 (선택)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder="가이드북에 대한 간단한 설명"
        />
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? '저장 중...' : initialData ? '저장' : '만들기'}
        </button>
      </div>
    </form>
  );
}
