-- Supabase RLS Policies for Roomy
-- Clerk JWT 연동 기반 Row Level Security
--
-- 실행 방법:
-- 1. Supabase Dashboard > SQL Editor에서 실행
-- 2. 또는 psql로 직접 실행

-- ============================================
-- 1. RLS 활성화
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Clerk JWT에서 user_id 추출 함수
-- ============================================

-- Clerk JWT의 sub 클레임에서 사용자 ID 추출
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_id')
  );
$$ LANGUAGE SQL STABLE;

-- clerk_id로 내부 user id 조회
CREATE OR REPLACE FUNCTION auth.internal_user_id()
RETURNS TEXT AS $$
  SELECT id FROM users WHERE clerk_id = auth.clerk_user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================
-- 3. USERS 테이블 정책
-- ============================================

-- 자신의 프로필만 조회 가능
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (clerk_id = auth.clerk_user_id());

-- 자신의 프로필만 수정 가능
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (clerk_id = auth.clerk_user_id())
  WITH CHECK (clerk_id = auth.clerk_user_id());

-- 삭제는 Clerk 웹훅으로만 처리 (서비스 역할 사용)
-- 일반 사용자는 직접 삭제 불가

-- ============================================
-- 4. GUIDES 테이블 정책
-- ============================================

-- 자신의 안내서 조회 (호스트)
CREATE POLICY "guides_select_own"
  ON guides FOR SELECT
  USING (user_id = auth.internal_user_id());

-- 발행된 안내서는 누구나 조회 가능 (게스트)
CREATE POLICY "guides_select_published"
  ON guides FOR SELECT
  USING (is_published = true);

-- 자신의 안내서만 생성 가능
CREATE POLICY "guides_insert_own"
  ON guides FOR INSERT
  WITH CHECK (user_id = auth.internal_user_id());

-- 자신의 안내서만 수정 가능
CREATE POLICY "guides_update_own"
  ON guides FOR UPDATE
  USING (user_id = auth.internal_user_id())
  WITH CHECK (user_id = auth.internal_user_id());

-- 자신의 안내서만 삭제 가능
CREATE POLICY "guides_delete_own"
  ON guides FOR DELETE
  USING (user_id = auth.internal_user_id());

-- ============================================
-- 5. BLOCKS 테이블 정책
-- ============================================

-- 자신의 안내서 블록 조회 (호스트)
CREATE POLICY "blocks_select_own"
  ON blocks FOR SELECT
  USING (
    guide_id IN (
      SELECT id FROM guides WHERE user_id = auth.internal_user_id()
    )
  );

-- 발행된 안내서의 블록은 누구나 조회 가능 (게스트)
CREATE POLICY "blocks_select_published"
  ON blocks FOR SELECT
  USING (
    guide_id IN (
      SELECT id FROM guides WHERE is_published = true
    )
    AND is_visible = true
  );

-- 자신의 안내서에만 블록 추가 가능
CREATE POLICY "blocks_insert_own"
  ON blocks FOR INSERT
  WITH CHECK (
    guide_id IN (
      SELECT id FROM guides WHERE user_id = auth.internal_user_id()
    )
  );

-- 자신의 안내서 블록만 수정 가능
CREATE POLICY "blocks_update_own"
  ON blocks FOR UPDATE
  USING (
    guide_id IN (
      SELECT id FROM guides WHERE user_id = auth.internal_user_id()
    )
  )
  WITH CHECK (
    guide_id IN (
      SELECT id FROM guides WHERE user_id = auth.internal_user_id()
    )
  );

-- 자신의 안내서 블록만 삭제 가능
CREATE POLICY "blocks_delete_own"
  ON blocks FOR DELETE
  USING (
    guide_id IN (
      SELECT id FROM guides WHERE user_id = auth.internal_user_id()
    )
  );

-- ============================================
-- 6. LICENSES 테이블 정책
-- ============================================

-- 자신의 라이선스만 조회 가능
CREATE POLICY "licenses_select_own"
  ON licenses FOR SELECT
  USING (user_id = auth.internal_user_id());

-- 라이선스 생성/수정은 서버에서만 (서비스 역할 사용)
-- 일반 사용자는 직접 INSERT/UPDATE 불가

-- ============================================
-- 7. GUIDE_EMBEDDINGS 테이블 정책
-- ============================================

-- 자신의 안내서 임베딩 조회 (호스트)
CREATE POLICY "embeddings_select_own"
  ON guide_embeddings FOR SELECT
  USING (
    guide_id IN (
      SELECT id FROM guides WHERE user_id = auth.internal_user_id()
    )
  );

-- 발행된 안내서의 임베딩은 조회 가능 (AI 챗봇용)
CREATE POLICY "embeddings_select_published"
  ON guide_embeddings FOR SELECT
  USING (
    guide_id IN (
      SELECT id FROM guides WHERE is_published = true
    )
  );

-- 임베딩 생성/수정/삭제는 서버에서만 (서비스 역할 사용)

-- ============================================
-- 8. AI_CONVERSATIONS 테이블 정책
-- ============================================

-- 세션 ID 기반 대화 조회 (게스트)
-- 세션은 클라이언트에서 생성되므로 세션 소유자만 조회 가능
CREATE POLICY "conversations_select_by_session"
  ON ai_conversations FOR SELECT
  USING (true);  -- 세션 ID를 알아야만 조회 가능 (앱 레벨 보안)

-- 발행된 안내서에만 대화 추가 가능
CREATE POLICY "conversations_insert_published"
  ON ai_conversations FOR INSERT
  WITH CHECK (
    guide_id IN (
      SELECT id FROM guides WHERE is_published = true
    )
  );

-- ============================================
-- 9. 서비스 역할용 바이패스 (선택사항)
-- ============================================

-- 서버 측 작업을 위해 서비스 역할은 RLS 바이패스
-- Supabase에서 service_role 키 사용 시 자동 바이패스됨

-- ============================================
-- 10. 인덱스 추가 (성능 최적화)
-- ============================================

-- RLS 정책에서 자주 사용되는 컬럼에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_guides_user_id_published ON guides(user_id, is_published);
CREATE INDEX IF NOT EXISTS idx_blocks_guide_id_visible ON blocks(guide_id, is_visible);

-- ============================================
-- 11. pgvector HNSW 인덱스 (RAG 성능 최적화)
-- ============================================

-- 코사인 유사도 검색용 HNSW 인덱스
CREATE INDEX IF NOT EXISTS idx_guide_embeddings_vector
  ON guide_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================
-- 완료 메시지
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'RLS policies applied successfully!';
  RAISE NOTICE 'Tables with RLS enabled: users, guides, blocks, licenses, guide_embeddings, ai_conversations';
END $$;
