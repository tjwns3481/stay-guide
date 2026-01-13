-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- v2 AI 챗봇 대비: PGVector extension
-- 사용 예시:
-- CREATE TABLE embeddings (
--   id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--   content text NOT NULL,
--   embedding vector(1536) NOT NULL
-- );
-- CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
