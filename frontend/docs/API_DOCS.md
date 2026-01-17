# Roomy API Documentation

## Overview

Roomy API는 숙박업소용 모바일 웹 안내서 서비스의 백엔드 API입니다.
**Hono** 프레임워크 기반으로 Next.js API Routes 위에서 실행됩니다.

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Production | `https://your-domain.vercel.app/api` |

## Authentication

Clerk JWT 토큰을 사용합니다. 인증이 필요한 엔드포인트는 `Authorization` 헤더에 Bearer 토큰을 포함해야 합니다.

```
Authorization: Bearer <clerk_jwt_token>
```

## Response Format

모든 API 응답은 다음 형식을 따릅니다:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }  // optional
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Endpoints

### Health Check

#### GET /api/health
서버 상태 확인

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T12:00:00.000Z",
  "uptime": 3600
}
```

---

#### GET /api/health/ready
서버 준비 상태 및 데이터베이스 연결 확인

**Authentication:** Not required

**Response (200):**
```json
{
  "status": "ready",
  "services": {
    "database": "connected"
  }
}
```

**Response (503 - Not Ready):**
```json
{
  "status": "not_ready",
  "services": {
    "database": "disconnected",
    "databaseError": "Connection refused"
  }
}
```

---

### Users

#### GET /api/users/me
현재 로그인한 사용자 프로필 조회

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "홍길동",
    "imageUrl": "https://...",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "license": {
      "plan": "free",
      "status": "active",
      "expiresAt": null,
      "features": {
        "maxGuides": 1,
        "aiChat": false,
        "customTheme": false,
        "noWatermark": false
      }
    },
    "stats": {
      "totalGuides": 3
    }
  }
}
```

---

#### PATCH /api/users/me
사용자 프로필 업데이트

**Authentication:** Required

**Request Body:**
```json
{
  "name": "새 이름"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | 1-50자 |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "새 이름",
    "imageUrl": "https://...",
    "updatedAt": "2026-01-18T12:00:00.000Z"
  }
}
```

---

#### DELETE /api/users/me
계정 삭제 (관련 데이터 모두 삭제)

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "계정이 성공적으로 삭제되었습니다"
  }
}
```

---

### Guides

#### GET /api/guides
내 안내서 목록 조회

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | 페이지 번호 |
| limit | number | 10 | 페이지당 항목 수 (최대 100) |
| search | string | - | 제목/숙소명 검색 |
| isPublished | boolean | - | 발행 상태 필터 |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clxxx...",
        "slug": "my-guesthouse",
        "title": "내 게스트하우스",
        "accommodationName": "해피 게스트하우스",
        "isPublished": true,
        "blocksCount": 5,
        "viewCount": 123,
        "createdAt": "2026-01-01T00:00:00.000Z",
        "updatedAt": "2026-01-15T00:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

---

#### POST /api/guides
새 안내서 생성

**Authentication:** Required

**Request Body:**
```json
{
  "title": "안내서 제목",
  "accommodationName": "숙소 이름",
  "slug": "my-guesthouse"  // optional, 미입력시 자동 생성
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | 1-100자 |
| accommodationName | string | Yes | 1-100자 |
| slug | string | No | 3-50자, 영문 소문자/숫자/하이픈만 |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "userId": "user_xxx",
    "slug": "my-guesthouse",
    "title": "안내서 제목",
    "accommodationName": "숙소 이름",
    "isPublished": false,
    "themeId": null,
    "themeSettings": null,
    "createdAt": "2026-01-18T12:00:00.000Z",
    "updatedAt": "2026-01-18T12:00:00.000Z",
    "blocks": []
  }
}
```

**Error Codes:**
- `DUPLICATE_SLUG` (409): 이미 사용 중인 슬러그
- `INVALID_SLUG` (400): 슬러그 형식 오류

---

#### GET /api/guides/check-slug
슬러그 사용 가능 여부 확인

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| slug | string | Yes | 확인할 슬러그 |

**Response:**
```json
{
  "success": true,
  "available": true,
  "reason": null,
  "message": null
}
```

**Response (Not Available):**
```json
{
  "success": true,
  "available": false,
  "reason": "taken",
  "message": "이미 사용 중인 URL입니다"
}
```

---

#### GET /api/guides/:id
안내서 상세 조회 (호스트용)

**Authentication:** Required (소유자만)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | 안내서 ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "userId": "user_xxx",
    "slug": "my-guesthouse",
    "title": "안내서 제목",
    "accommodationName": "숙소 이름",
    "isPublished": true,
    "themeId": "emotional",
    "themeSettings": {
      "preset": "emotional",
      "primaryColor": "#4A90A4"
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-15T00:00:00.000Z",
    "blocks": [
      {
        "id": "block_xxx",
        "type": "hero",
        "order": 0,
        "content": {
          "title": "환영합니다",
          "subtitle": "편안한 휴식을 드립니다"
        },
        "isVisible": true
      }
    ]
  }
}
```

**Error Codes:**
- `GUIDE_NOT_FOUND` (404): 안내서 없음
- `FORBIDDEN` (403): 접근 권한 없음

---

#### GET /api/guides/slug/:slug
슬러그로 안내서 조회 (게스트용, 공개된 안내서만)

**Authentication:** Not required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | 안내서 슬러그 |

**Response Headers:**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "slug": "my-guesthouse",
    "title": "안내서 제목",
    "accommodationName": "숙소 이름",
    "isPublished": true,
    "themeSettings": { ... },
    "blocks": [ ... ]
  }
}
```

---

#### PATCH /api/guides/:id
안내서 수정

**Authentication:** Required (소유자만)

**Request Body:**
```json
{
  "title": "새 제목",
  "accommodationName": "새 숙소명",
  "slug": "new-slug",
  "themeId": "modern",
  "themeSettings": {
    "preset": "modern",
    "primaryColor": "#2D3436"
  },
  "blocks": [
    {
      "id": "block_xxx",
      "type": "hero",
      "order": 0,
      "content": { "title": "환영합니다" },
      "isVisible": true
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | 1-100자 |
| accommodationName | string | No | 1-100자 |
| slug | string | No | 3-50자 |
| themeId | string\|null | No | 테마 ID |
| themeSettings | object\|null | No | 테마 설정 |
| blocks | array | No | 블록 배열 (전체 교체) |

**Block Types:**
- `hero` - 히어로 이미지
- `quick_info` - 빠른 정보 (체크인/아웃, 인원 등)
- `amenities` - 편의시설 (WiFi 등)
- `map` - 지도
- `host_pick` - 호스트 추천
- `notice` - 공지사항
- `gallery` - 갤러리

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### DELETE /api/guides/:id
안내서 삭제

**Authentication:** Required (소유자만)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "안내서가 삭제되었습니다"
  }
}
```

---

#### POST /api/guides/:id/publish
안내서 발행/발행 취소

**Authentication:** Required (소유자만)

**Request Body:**
```json
{
  "isPublished": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "isPublished": true,
    "slug": "my-guesthouse",
    "publicUrl": "https://your-domain.com/g/my-guesthouse"
  }
}
```

---

#### POST /api/guides/:id/duplicate
안내서 복제

**Authentication:** Required (소유자만)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new_guide_id",
    "title": "안내서 제목 (복사본)",
    "slug": "abc123xyz",
    "isPublished": false,
    ...
  }
}
```

---

### AI

#### GET /api/ai/status
AI Provider 상태 확인

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "gemini",
    "status": "configured",
    "stack": {
      "llm": "Google Gemini 2.0 Flash (Long Context)",
      "method": "Direct context injection (no RAG)"
    },
    "message": "Long Context 방식 사용 중 (RAG 제거됨)"
  }
}
```

---

#### POST /api/guides/:guideId/ai/chat
AI 채팅 (Server-Sent Events)

**Authentication:** Not required (발행된 안내서만)

**Request Body:**
```json
{
  "message": "체크인 시간이 어떻게 되나요?",
  "sessionId": "session_xxx"  // optional
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | 1-1000자 |
| sessionId | string | No | 세션 ID (대화 기록용) |

**Response:** Server-Sent Events stream

```
event: thinking
data: {"status":"processing"}

event: chunk
data: {"content":"체크인 시간은 "}

event: chunk
data: {"content":"오후 3시입니다."}

event: done
data: {"fullResponse":"체크인 시간은 오후 3시입니다."}
```

---

#### GET /api/guides/:guideId/ai/conversations
대화 기록 조회 (호스트 전용)

**Authentication:** Required (소유자만)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 |
| sessionId | string | - | 특정 세션 필터 |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "conv_xxx",
        "sessionId": "session_xxx",
        "role": "user",
        "content": "체크인 시간이요?",
        "createdAt": "2026-01-18T12:00:00.000Z"
      },
      {
        "id": "conv_yyy",
        "sessionId": "session_xxx",
        "role": "assistant",
        "content": "체크인은 오후 3시입니다.",
        "createdAt": "2026-01-18T12:00:01.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

#### GET /api/guides/:guideId/ai/conversations/:sessionId
특정 세션의 대화 기록 조회 (호스트 전용)

**Authentication:** Required (소유자만)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_xxx",
    "messages": [ ... ]
  }
}
```

---

#### DELETE /api/guides/:guideId/ai/conversations/:sessionId
대화 기록 삭제 (호스트 전용)

**Authentication:** Required (소유자만)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "대화 기록이 삭제되었습니다",
    "deletedCount": 15
  }
}
```

---

#### GET /api/guides/:guideId/ai/stats
AI 통계 조회 (호스트 전용)

**Authentication:** Required (소유자만)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConversations": 25,
    "totalMessages": 150,
    "averageMessagesPerSession": 6,
    "topQuestions": []
  }
}
```

---

#### GET /api/guides/:guideId/ai/settings
AI 설정 조회 (호스트 전용)

**Authentication:** Required (소유자만)

**Response:**
```json
{
  "success": true,
  "data": {
    "aiEnabled": true,
    "aiInstructions": "친절하게 응대해주세요."
  }
}
```

---

#### PUT /api/guides/:guideId/ai/settings
AI 설정 업데이트 (호스트 전용)

**Authentication:** Required (소유자만)

**Request Body:**
```json
{
  "aiEnabled": true,
  "aiInstructions": "게스트에게 친절하게 응대해주세요. 주변 맛집도 추천해주세요."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| aiEnabled | boolean | No | AI 기능 활성화 여부 |
| aiInstructions | string | No | AI 커스텀 지침 (최대 5000자) |

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "AI 설정이 업데이트되었습니다",
    "aiEnabled": true,
    "aiInstructions": "게스트에게 친절하게 응대해주세요. 주변 맛집도 추천해주세요."
  }
}
```

---

### Licenses

#### POST /api/licenses/verify
라이선스 키 형식 검증 (활성화 전 확인용)

**Authentication:** Not required

**Request Body:**
```json
{
  "licenseKey": "ROOMY-XXXX-XXXX-XXXX"
}
```

**Response:**
```json
{
  "valid": true,
  "plan": "monthly"
}
```

---

#### POST /api/licenses/activate
라이선스 활성화

**Authentication:** Required

**Request Body:**
```json
{
  "licenseKey": "ROOMY-XXXX-XXXX-XXXX"
}
```

**Response:**
```json
{
  "success": true,
  "license": {
    "id": "lic_xxx",
    "plan": "monthly",
    "status": "active",
    "activatedAt": "2026-01-18T12:00:00.000Z",
    "expiresAt": "2026-02-18T12:00:00.000Z"
  }
}
```

**Error Codes:**
- `INVALID_KEY_FORMAT` (400): 잘못된 키 형식
- `KEY_ALREADY_USED` (409): 이미 사용된 키

---

#### GET /api/licenses/me
현재 라이선스 조회

**Authentication:** Required

**Response (유료 플랜):**
```json
{
  "plan": "monthly",
  "status": "active",
  "features": {
    "maxGuides": 10,
    "maxBlocksPerGuide": 20,
    "aiConcierge": true,
    "customTheme": true,
    "noWatermark": true,
    "analytics": true
  },
  "expiresAt": "2026-02-18T12:00:00.000Z"
}
```

**Response (무료 플랜):**
```json
{
  "plan": "free",
  "status": "active",
  "features": {
    "maxGuides": 1,
    "maxBlocksPerGuide": 6,
    "aiConcierge": false,
    "customTheme": false,
    "noWatermark": false,
    "analytics": false
  },
  "expiresAt": null
}
```

---

### Upload

#### POST /api/upload
이미지 업로드

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | 이미지 파일 (최대 5MB) |

**Allowed Types:**
- image/jpeg
- image/png
- image/gif
- image/webp

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://xxx.supabase.co/storage/v1/object/public/guide-images/user_xxx/abc123.jpg",
    "path": "user_xxx/abc123.jpg",
    "size": 102400,
    "type": "image/jpeg"
  }
}
```

**Error Codes:**
- `FILE_REQUIRED` (400): 파일 없음
- `INVALID_FILE_TYPE` (400): 이미지가 아닌 파일
- `FILE_TOO_LARGE` (400): 5MB 초과
- `UPLOAD_FAILED` (500): 업로드 실패

---

### Webhooks

#### POST /api/webhooks/clerk
Clerk 사용자 동기화 웹훅

**Authentication:** Svix signature verification

**Headers:**
```
svix-id: msg_xxx
svix-timestamp: 1234567890
svix-signature: v1,xxx...
```

**Supported Events:**
- `user.created` - 사용자 생성
- `user.updated` - 사용자 정보 변경
- `user.deleted` - 사용자 삭제

**Response:**
```json
{
  "success": true,
  "data": {
    "received": true,
    "type": "user.created"
  }
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `USER_NOT_FOUND` | 404 | 사용자를 찾을 수 없음 |
| `GUIDE_NOT_FOUND` | 404 | 안내서를 찾을 수 없음 |
| `NOT_FOUND` | 404 | 리소스를 찾을 수 없음 |
| `FORBIDDEN` | 403 | 접근 권한 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `INVALID_SLUG` | 400 | 슬러그 형식 오류 |
| `DUPLICATE_SLUG` | 409 | 중복된 슬러그 |
| `INVALID_KEY_FORMAT` | 400 | 라이선스 키 형식 오류 |
| `KEY_ALREADY_USED` | 409 | 이미 사용된 라이선스 키 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

## Rate Limiting

현재 Rate Limiting은 적용되어 있지 않습니다. 추후 추가될 예정입니다.

---

## CORS

| Origin | Allowed |
|--------|---------|
| http://localhost:3000 | Yes |
| http://localhost:5173 | Yes |

---

## Changelog

### v0.1.0 (2026-01-18)
- Initial API documentation
- Health, Users, Guides, AI, Licenses, Upload, Webhooks endpoints
