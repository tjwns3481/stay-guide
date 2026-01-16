/**
 * AI 서비스 모듈 - Long Context 방식
 *
 * 기술 스택:
 * - LLM: Google Gemini 2.0 Flash (Long Context Window 활용)
 * - 데이터: Prisma를 통한 직접 DB 조회
 *
 * 변경 이력:
 * - RAG/임베딩/벡터 검색 방식 제거
 * - LangChain 의존성 제거
 * - @google/generative-ai SDK 직접 사용
 */

export * from './llm'
export * from './chat'
