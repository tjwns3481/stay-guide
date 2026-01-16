/**
 * Free RAG Stack - AI 서비스 모듈
 *
 * 기술 스택:
 * - 임베딩: HuggingFace sentence-transformers/all-mpnet-base-v2 (768차원, 무료)
 * - 벡터 DB: Supabase pgvector (PostgreSQL, 무료 티어)
 * - LLM: Google Gemini Flash via LangChain (무료 티어)
 * - 검색: 하이브리드 검색 (키워드 + 벡터)
 */

export * from './embeddings'
export * from './vectorstore'
export * from './llm'
export * from './chat'
