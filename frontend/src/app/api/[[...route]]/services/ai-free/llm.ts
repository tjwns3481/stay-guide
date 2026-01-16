/**
 * Google Generative AI SDK를 직접 사용한 LLM 서비스
 * 모델: gemini-2.0-flash (Long Context Window 활용)
 *
 * 변경 이력:
 * - RAG/임베딩 방식 제거
 * - LangChain 의존성 제거
 * - @google/generative-ai SDK 직접 사용
 * - 숙소 전체 데이터를 프롬프트에 직접 주입
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerativeModel,
  type Content,
} from '@google/generative-ai'

export type LLMProvider = 'gemini'

let genAI: GoogleGenerativeAI | null = null
let model: GenerativeModel | null = null

function getModel(): GenerativeModel {
  if (!model) {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error(
        'GOOGLE_API_KEY is not set. Get free API key from https://aistudio.google.com/apikey'
      )
    }

    genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    })
  }
  return model
}

export function getLLMProvider(): LLMProvider {
  return 'gemini'
}

/**
 * 대화 메시지 타입
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * 블록 데이터를 읽기 좋은 텍스트로 변환
 */
export function formatBlocksForContext(
  blocks: Array<{
    type: string
    content: Record<string, unknown>
    isVisible: boolean
  }>
): string {
  const visibleBlocks = blocks.filter((b) => b.isVisible)

  if (visibleBlocks.length === 0) {
    return '(숙소 정보가 아직 등록되지 않았습니다.)'
  }

  return visibleBlocks
    .map((block) => formatSingleBlock(block.type, block.content))
    .filter((text) => text.trim().length > 0)
    .join('\n\n')
}

/**
 * 단일 블록을 텍스트로 변환
 */
function formatSingleBlock(
  type: string,
  content: Record<string, unknown>
): string {
  switch (type) {
    case 'hero': {
      const title = (content.title as string) || ''
      const subtitle = (content.subtitle as string) || ''
      if (!title && !subtitle) return ''
      return `## 숙소 소개\n${title}${subtitle ? `\n${subtitle}` : ''}`
    }

    case 'quick_info': {
      const parts: string[] = []
      if (content.checkIn) parts.push(`- 체크인: ${content.checkIn}`)
      if (content.checkOut) parts.push(`- 체크아웃: ${content.checkOut}`)
      if (content.maxGuests) parts.push(`- 최대 인원: ${content.maxGuests}명`)
      if (content.parking) parts.push(`- 주차: ${content.parking}`)
      if (content.address) parts.push(`- 주소: ${content.address}`)
      if (parts.length === 0) return ''
      return `## 기본 정보\n${parts.join('\n')}`
    }

    case 'amenities': {
      const parts: string[] = []
      const wifi = content.wifi as { ssid?: string; password?: string } | null
      if (wifi?.ssid) parts.push(`- Wi-Fi 이름(SSID): ${wifi.ssid}`)
      if (wifi?.password) parts.push(`- Wi-Fi 비밀번호: ${wifi.password}`)

      const items = (content.items as { label: string }[]) || []
      if (items.length > 0) {
        parts.push(`- 편의시설: ${items.map((i) => i.label).join(', ')}`)
      }
      if (parts.length === 0) return ''
      return `## 편의시설 및 Wi-Fi\n${parts.join('\n')}`
    }

    case 'map': {
      const parts: string[] = []
      if (content.address) parts.push(`- 주소: ${content.address}`)
      if (content.description) parts.push(`- 찾아오는 길: ${content.description}`)
      if (content.naverMapUrl) parts.push(`- 네이버 지도: ${content.naverMapUrl}`)
      if (content.kakaoMapUrl) parts.push(`- 카카오맵: ${content.kakaoMapUrl}`)
      if (parts.length === 0) return ''
      return `## 위치 안내\n${parts.join('\n')}`
    }

    case 'host_pick': {
      const title = (content.title as string) || '호스트 추천'
      const picks = (content.items as { name: string; category?: string; description?: string; url?: string }[]) || []
      if (picks.length === 0) return ''

      const pickTexts = picks.map((p) => {
        let text = `- ${p.name}`
        if (p.category) text += ` (${p.category})`
        if (p.description) text += `: ${p.description}`
        return text
      })
      return `## ${title}\n${pickTexts.join('\n')}`
    }

    case 'notice': {
      const title = (content.title as string) || '공지사항'
      const text = (content.content as string) || ''
      if (!text) return ''
      return `## ${title}\n${text}`
    }

    default:
      return ''
  }
}

/**
 * 시스템 프롬프트 구성
 */
export function buildSystemPrompt(
  accommodationName: string,
  blocksContext: string,
  hostInstructions?: string | null
): string {
  let prompt = `당신은 "${accommodationName}" 숙소의 AI 컨시어지입니다.

## 역할
게스트의 질문에 친절하고 정확하게 답변하는 것이 당신의 역할입니다.

## 숙소 정보
아래는 이 숙소에 대한 모든 정보입니다. 이 정보만을 기반으로 답변해주세요.

${blocksContext}

## 답변 원칙
1. 위의 숙소 정보에 있는 내용만 답변하세요.
2. 정보가 없는 경우 "해당 정보는 안내서에 없습니다. 호스트에게 직접 문의해주세요."라고 안내하세요.
3. 간결하고 명확하게 답변하세요.
4. 한국어로 답변하세요.
5. 친절하고 따뜻한 톤을 유지하세요.

## 금지 사항
- 숙소 정보에 없는 내용을 추측하거나 지어내지 마세요.
- 다른 숙소나 경쟁 업체를 추천하지 마세요.
- 개인적인 의견이나 평가를 하지 마세요.`

  if (hostInstructions) {
    prompt += `

## 호스트 추가 지침
${hostInstructions}`
  }

  return prompt
}

/**
 * 대화 기록을 Gemini Content 형식으로 변환
 */
function convertToGeminiHistory(chatHistory: ChatMessage[]): Content[] {
  return chatHistory
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))
}

/**
 * 스트리밍 LLM 응답 생성
 * @param systemPrompt 시스템 프롬프트 (숙소 전체 정보 포함)
 * @param userMessage 사용자 메시지
 * @param chatHistory 이전 대화 기록
 */
export async function* streamLLMResponse(
  systemPrompt: string,
  userMessage: string,
  chatHistory: ChatMessage[] = []
): AsyncGenerator<string> {
  const geminiModel = getModel()

  // 대화 기록을 Gemini 형식으로 변환
  const history = convertToGeminiHistory(chatHistory)

  // 채팅 세션 시작
  // Gemini API는 systemInstruction을 Content 객체 형식으로 요구함
  const chat = geminiModel.startChat({
    history,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
  })

  console.log(
    `[LLM] Generating response with ${chatHistory.length} previous messages`
  )

  try {
    // 스트리밍 응답
    const result = await chat.sendMessageStream(userMessage)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        yield text
      }
    }
  } catch (error) {
    // 상세 에러 로깅
    console.error('[LLM] Streaming error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
      error: JSON.stringify(error, null, 2),
    })
    throw error
  }
}

/**
 * 비스트리밍 LLM 응답 생성
 */
export async function generateLLMResponse(
  systemPrompt: string,
  userMessage: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  const geminiModel = getModel()

  const history = convertToGeminiHistory(chatHistory)

  // Gemini API는 systemInstruction을 Content 객체 형식으로 요구함
  const chat = geminiModel.startChat({
    history,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
  })

  try {
    const result = await chat.sendMessage(userMessage)
    return result.response.text()
  } catch (error) {
    console.error('[LLM] Generation error:', error)
    throw error
  }
}
