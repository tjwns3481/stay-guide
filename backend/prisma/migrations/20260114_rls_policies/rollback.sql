-- RLS 정책 롤백 스크립트
-- 문제 발생 시 이 스크립트로 RLS를 비활성화할 수 있습니다

-- ============================================
-- 1. 정책 삭제
-- ============================================

-- Users
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Guides
DROP POLICY IF EXISTS "guides_select_own" ON guides;
DROP POLICY IF EXISTS "guides_select_published" ON guides;
DROP POLICY IF EXISTS "guides_insert_own" ON guides;
DROP POLICY IF EXISTS "guides_update_own" ON guides;
DROP POLICY IF EXISTS "guides_delete_own" ON guides;

-- Blocks
DROP POLICY IF EXISTS "blocks_select_own" ON blocks;
DROP POLICY IF EXISTS "blocks_select_published" ON blocks;
DROP POLICY IF EXISTS "blocks_insert_own" ON blocks;
DROP POLICY IF EXISTS "blocks_update_own" ON blocks;
DROP POLICY IF EXISTS "blocks_delete_own" ON blocks;

-- Licenses
DROP POLICY IF EXISTS "licenses_select_own" ON licenses;

-- Guide Embeddings
DROP POLICY IF EXISTS "embeddings_select_own" ON guide_embeddings;
DROP POLICY IF EXISTS "embeddings_select_published" ON guide_embeddings;

-- AI Conversations
DROP POLICY IF EXISTS "conversations_select_by_session" ON ai_conversations;
DROP POLICY IF EXISTS "conversations_insert_published" ON ai_conversations;

-- ============================================
-- 2. RLS 비활성화
-- ============================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE guides DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE guide_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. 함수 삭제
-- ============================================

DROP FUNCTION IF EXISTS auth.clerk_user_id();
DROP FUNCTION IF EXISTS auth.internal_user_id();

-- ============================================
-- 4. 인덱스는 유지 (성능에 도움됨)
-- ============================================

-- 인덱스를 삭제하려면 아래 주석 해제:
-- DROP INDEX IF EXISTS idx_users_clerk_id;
-- DROP INDEX IF EXISTS idx_guides_user_id_published;
-- DROP INDEX IF EXISTS idx_blocks_guide_id_visible;
-- DROP INDEX IF EXISTS idx_guide_embeddings_vector;

DO $$
BEGIN
  RAISE NOTICE 'RLS policies rolled back successfully!';
END $$;
