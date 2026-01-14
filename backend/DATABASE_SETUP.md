# Roomy - Database Setup Guide

Roomy는 **Supabase (PostgreSQL 15+)**를 데이터베이스로 사용합니다.
이 가이드는 Supabase 프로젝트 생성부터 pgvector 확장 활성화, Prisma 마이그레이션까지 전체 과정을 안내합니다.

---

## 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [pgvector 확장 활성화](#2-pgvector-확장-활성화)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [Prisma 마이그레이션 실행](#4-prisma-마이그레이션-실행)
5. [연결 확인](#5-연결-확인)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성
1. [https://supabase.com](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub/Google 계정으로 로그인

### 1.2 새 프로젝트 생성
1. Dashboard에서 "New Project" 클릭
2. 프로젝트 정보 입력:
   - **Name**: `roomy-production` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (반드시 저장!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 서비스용)
   - **Pricing Plan**: Free 또는 Pro

3. "Create new project" 클릭 (약 2분 소요)

### 1.3 프로젝트 정보 확인
프로젝트 생성 완료 후 다음 정보를 확인합니다:

**Dashboard > Settings > Database**
- **Connection String (Session mode)**: `DIRECT_URL`에 사용
- **Connection String (Transaction mode)**: `DATABASE_URL`에 사용
- **Project Ref**: URL에서 확인 (예: `abcdefghijklmnop`)

**Dashboard > Settings > API**
- **Project URL**: `SUPABASE_URL`
- **anon public key**: `SUPABASE_ANON_KEY`
- **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (보안 주의!)

---

## 2. pgvector 확장 활성화

Roomy는 AI 컨시어지 기능을 위해 **pgvector** 확장을 사용합니다.
(OpenAI 임베딩을 벡터로 저장하여 유사도 검색 수행)

### 2.1 SQL Editor에서 확장 활성화

1. Supabase Dashboard에서 **SQL Editor** 메뉴 클릭
2. "New query" 버튼 클릭
3. 아래 SQL 명령어를 복사 & 붙여넣기:

```sql
-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 확장 설치 확인
SELECT * FROM pg_extension WHERE extname = 'vector';
```

4. "Run" 버튼 클릭 (또는 Ctrl + Enter)
5. 결과에 `vector` 행이 표시되면 성공

### 2.2 벡터 유사도 검색 함수 생성 (선택사항)

AI 컨시어지 RAG 성능 향상을 위해 코사인 유사도 검색 함수를 미리 생성할 수 있습니다.

```sql
-- 코사인 유사도로 가장 유사한 임베딩 찾기 함수
CREATE OR REPLACE FUNCTION match_guide_embeddings(
  query_embedding vector(1536),
  target_guide_id text,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id text,
  guide_id text,
  block_id text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    guide_embeddings.id,
    guide_embeddings.guide_id,
    guide_embeddings.block_id,
    guide_embeddings.content,
    1 - (guide_embeddings.embedding <=> query_embedding) AS similarity
  FROM guide_embeddings
  WHERE guide_embeddings.guide_id = target_guide_id
    AND 1 - (guide_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

---

## 3. 환경 변수 설정

### 3.1 .env 파일 생성

프로젝트 루트에서 `.env.example`을 복사하여 `.env` 파일을 생성합니다.

```bash
# 루트 디렉토리에서
cp .env.example .env
```

### 3.2 환경 변수 채우기

`.env` 파일을 열어 Supabase에서 확인한 정보를 입력합니다.

```env
# ===========================================
# Roomy Environment Variables
# ===========================================

# Supabase (Dashboard > Settings > API)
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Dashboard > Settings > Database > Connection String)
# Transaction mode (pgbouncer=true) - Prisma 마이그레이션용
DATABASE_URL=postgresql://postgres.[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

# Session mode - Prisma Client 쿼리용
DIRECT_URL=postgresql://postgres.[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Clerk Authentication (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# OpenAI (AI Concierge)
OPENAI_API_KEY=sk-xxxxx
```

### 3.3 주의사항

- `[PASSWORD]`: 프로젝트 생성 시 설정한 Database Password
- `[PROJECT_REF]`: 프로젝트 Reference ID (URL에서 확인)
- **Connection String 차이점**:
  - `DATABASE_URL` (Port 6543, pgbouncer=true): 마이그레이션 전용
  - `DIRECT_URL` (Port 5432): Prisma Client 쿼리 전용

---

## 4. Prisma 마이그레이션 실행

### 4.1 Prisma 설치 확인

```bash
cd backend
bun install
```

### 4.2 마이그레이션 실행

```bash
# 개발 환경 마이그레이션 (초기 세팅 시)
bun run db:migrate:dev

# 또는 수동 실행
bunx prisma migrate dev --name init
```

이 명령어는 다음을 수행합니다:
1. `.env`의 `DATABASE_URL`로 Supabase에 연결
2. `prisma/schema.prisma`를 기반으로 SQL 마이그레이션 생성
3. 생성된 SQL을 Supabase에 적용
4. Prisma Client 재생성

### 4.3 생성되는 테이블

마이그레이션 성공 시 다음 테이블이 생성됩니다:

- `users` - 사용자 (Clerk 연동)
- `guides` - 안내서
- `blocks` - 블록 (안내서 콘텐츠)
- `licenses` - 라이선스 (스마트스토어 연동)
- `guide_embeddings` - AI 임베딩 (pgvector)
- `ai_conversations` - AI 대화 기록

### 4.4 프로덕션 배포 시 마이그레이션

```bash
# 프로덕션 환경 마이그레이션
bunx prisma migrate deploy
```

---

## 5. 연결 확인

### 5.1 Prisma Studio로 DB 확인

```bash
cd backend
bunx prisma studio
```

브라우저에서 `http://localhost:5555`로 접속하여 테이블 구조를 시각적으로 확인할 수 있습니다.

### 5.2 연결 테스트 스크립트

`backend/scripts/test-db-connection.ts` 파일을 생성하여 연결을 테스트합니다.

```typescript
// backend/scripts/test-db-connection.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // 1. 기본 연결 테스트
    await prisma.$connect();
    console.log('✅ Connected to Supabase successfully');

    // 2. 테이블 존재 확인
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible (count: ${userCount})`);

    // 3. pgvector 확장 확인
    const result = await prisma.$queryRaw`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname = 'vector'
    `;
    console.log('✅ pgvector extension:', result);

    console.log('\n🎉 All checks passed!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

실행:

```bash
bun run scripts/test-db-connection.ts
```

---

## 6. 트러블슈팅

### 문제 1: "P1001: Can't reach database server"

**원인**: 잘못된 DATABASE_URL 또는 네트워크 문제

**해결**:
1. `.env`의 `DATABASE_URL`과 `DIRECT_URL`이 올바른지 확인
2. Database Password가 정확한지 확인
3. Supabase 프로젝트가 활성 상태인지 확인
4. 방화벽/VPN 설정 확인

### 문제 2: "Extension 'vector' not found"

**원인**: pgvector 확장이 활성화되지 않음

**해결**:
1. Supabase SQL Editor에서 확장 활성화 재실행:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. Prisma 스키마에 `extensions = [pgvector(map: "vector")]` 있는지 확인

### 문제 3: "Too many connections"

**원인**: Connection pooling 미설정

**해결**:
1. `DATABASE_URL`에 `pgbouncer=true&connection_limit=1` 추가
2. Supabase Dashboard > Database > Connection Pooling 확인

### 문제 4: "Migration failed: relation already exists"

**원인**: 기존 테이블과 충돌

**해결**:
1. 개발 환경에서 DB 초기화:
   ```bash
   bunx prisma migrate reset
   ```
2. 또는 수동으로 충돌하는 테이블 삭제 후 재시도

---

## 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] pgvector 확장 활성화
- [ ] `.env` 파일 생성 및 환경변수 설정
- [ ] Prisma 마이그레이션 성공 (`bunx prisma migrate dev`)
- [ ] Supabase 대시보드에서 테이블 확인
- [ ] 연결 테스트 스크립트 실행 (선택사항)

---

## 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [pgvector 가이드](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Prisma Migrate 가이드](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## 다음 단계

데이터베이스 설정이 완료되었다면:

1. **시드 데이터 생성** (선택사항)
   ```bash
   cd backend
   bun run db:seed
   ```

2. **백엔드 개발 서버 실행**
   ```bash
   cd backend
   bun run dev
   ```

3. **프론트엔드 개발 서버 실행**
   ```bash
   cd frontend
   npm run dev
   ```

---

**마지막 업데이트**: 2026-01-14
