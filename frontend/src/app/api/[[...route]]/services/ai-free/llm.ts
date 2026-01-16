/**
 * LangChain을 사용한 LLM 서비스
 * 모델: Google Gemini Flash (Free Tier)
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  type BaseMessage,
} from '@langchain/core/messages'

export type LLMProvider = 'gemini'

let chatModel: ChatGoogleGenerativeAI | null = null

function getChatModel(): ChatGoogleGenerativeAI {
  if (!chatModel) {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error(
        'GOOGLE_API_KEY is not set. Get free API key from https://aistudio.google.com/apikey'
      )
    }
    chatModel = new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxRetries: 2,
      streaming: true,
    })
  }
  return chatModel
}

export function getLLMProvider(): LLMProvider {
  return 'gemini'
}

// 기본 시스템 프롬프트
const BASE_SYSTEM_PROMPT = `당신은 숙소 안내서의 AI 컨시어지입니다.

## 기본 원칙
1. 게스트의 질문에 친절하고 정확하게 답변하세요.
2. 제공된 숙소 정보를 기반으로만 답변하세요.
3. 정보가 없는 경우 "해당 정보는 안내서에 없습니다. 호스트에게 직접 문의해주세요."라고 안내하세요.
4. 간결하고 명확하게 답변하세요.
5. 한국어로 답변하세요.

## 금지 사항
- 숙소 정보에 없는 내용을 추측하거나 지어내지 마세요.
- 다른 숙소나 경쟁 업체를 추천하지 마세요.
- 개인적인 의견이나 평가를 하지 마세요.`

/**
 * 시스템 프롬프트 구성
 */
export function buildSystemPrompt(hostInstructions?: string | null): string {
  if (!hostInstructions) {
    return BASE_SYSTEM_PROMPT
  }

  return `${BASE_SYSTEM_PROMPT}

## 호스트 추가 지침
${hostInstructions}`
}

/**
 * 대화 메시지 타입
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * 스트리밍 LLM 응답 생성
 * @param systemPrompt 시스템 프롬프트
 * @param context RAG로 검색된 숙소 정보 컨텍스트
 * @param userMessage 사용자 메시지
 * @param accommodationName 숙소 이름
 * @param chatHistory 이전 대화 기록
 */
export async function* streamLLMResponse(
  systemPrompt: string,
  context: string,
  userMessage: string,
  accommodationName: string,
  chatHistory: ChatMessage[] = []
): AsyncGenerator<string> {
  const model = getChatModel()

  // LangChain 메시지 배열 구성
  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
  ]

  // 컨텍스트가 있으면 추가
  if (context) {
    messages.push(
      new SystemMessage(`[${accommodationName}] 숙소 정보:\n${context}`)
    )
  }

  // 이전 대화 기록 추가
  for (const msg of chatHistory) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content))
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content))
    }
    // system role은 이미 처리됨
  }

  // 현재 사용자 메시지 추가
  messages.push(new HumanMessage(userMessage))

  console.log(`[LLM] Generating response with ${chatHistory.length} previous messages`)

  try {
    // 스트리밍 응답
    const stream = await model.stream(messages)

    for await (const chunk of stream) {
      const content = chunk.content
      if (typeof content === 'string' && content) {
        yield content
      }
    }
  } catch (error) {
    console.error('[LLM] Streaming error:', error)
    throw error
  }
}

/**
 * 비스트리밍 LLM 응답 생성
 */
export async function generateLLMResponse(
  systemPrompt: string,
  context: string,
  userMessage: string,
  accommodationName: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  const model = getChatModel()

  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
  ]

  if (context) {
    messages.push(
      new SystemMessage(`[${accommodationName}] 숙소 정보:\n${context}`)
    )
  }

  for (const msg of chatHistory) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content))
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content))
    }
  }

  messages.push(new HumanMessage(userMessage))

  try {
    const response = await model.invoke(messages)
    return typeof response.content === 'string' ? response.content : ''
  } catch (error) {
    console.error('[LLM] Generation error:', error)
    throw error
  }
}
