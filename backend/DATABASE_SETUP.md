# Supabase 데이터베이스 셋업 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `roomy` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 설정 (저장해두세요!)
   - **Region**: `Northeast Asia (Seoul)` 권장
4. **Create new project** 클릭

## 2. pgvector 확장 활성화

Supabase Dashboard에서:

1. **Database** > **Extensions** 이동
2. `vector` 검색
3. **Enable** 클릭

또는 SQL Editor에서:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 3. 환경변수 설정

### Supabase 대시보드에서 정보 확인

1. **Project Settings** > **API** 이동
2. 다음 값들을 복사:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Project Settings** > **Database** 이동
4. **Connection string** > **URI** 복사:
   - `DATABASE_URL` (Pooler 연결 - Transaction mode)
   - `DIRECT_URL` (Direct 연결)

### .env 파일 생성

```bash
cd backend
cp .env.example .env
```

`.env` 파일을 열고 복사한 값들로 교체:

```env
# Supabase
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Database (Prisma)
DATABASE_URL=postgresql://postgres.[your-project-ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.[your-project-ref].supabase.co:5432/postgres
```

## 4. 데이터베이스 테이블 생성

환경변수 설정 후 실행:

```bash
cd backend

# 스키마를 데이터베이스에 푸시
npx prisma db push

# Prisma Studio로 테이블 확인 (선택사항)
npx prisma studio
```

## 5. 테이블 확인

Supabase Dashboard에서:

1. **Table Editor** 이동
2. 다음 테이블들이 생성되었는지 확인:
   - `users`
   - `guides`
   - `blocks`
   - `licenses`
   - `guide_embeddings`
   - `ai_conversations`

## 6. RLS 정책 설정 (선택사항)

보안을 위해 Row Level Security를 활성화하려면:

```sql
-- Users 테이블 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Guides 테이블 RLS
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- 사용자 본인 데이터만 접근 허용
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own guides" ON guides
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));
```

## 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] pgvector 확장 활성화
- [ ] `.env` 파일 생성 및 환경변수 설정
- [ ] `npx prisma db push` 성공
- [ ] Supabase 대시보드에서 테이블 확인

## 문제 해결

### "P1001: Can't reach database server" 에러

- DATABASE_URL과 DIRECT_URL이 올바른지 확인
- 비밀번호에 특수문자가 있으면 URL 인코딩 필요

### "extension "vector" is not available" 에러

- Supabase Dashboard에서 pgvector 확장이 활성화되었는지 확인

### "SSL connection error" 에러

- DATABASE_URL에 `?sslmode=require` 추가
