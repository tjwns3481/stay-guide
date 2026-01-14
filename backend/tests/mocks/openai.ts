/**
 * OpenAI Mock for Testing
 */

// Mock 임베딩 벡터 (1536 차원)
export const mockEmbedding = Array(1536).fill(0).map((_, i) => Math.sin(i * 0.01))

// Mock GPT 응답
export const mockChatResponses = [
  '체크인 시간은 오후 3시부터 가능합니다.',
  '체크아웃은 오전 11시까지 부탁드립니다.',
  '주차 공간은 숙소 앞에 1대 가능합니다.',
]

// OpenAI Mock Client
export const openaiMock = {
  embeddings: {
    create: async () => ({
      data: [{ embedding: mockEmbedding }],
    }),
  },
  chat: {
    completions: {
      create: async (params: { stream?: boolean }) => {
        const response = mockChatResponses[0]

        if (params.stream) {
          // 스트리밍 응답 mock
          return (async function* () {
            const words = response.split(' ')
            for (const word of words) {
              yield {
                choices: [
                  {
                    delta: { content: word + ' ' },
                  },
                ],
              }
            }
          })()
        }

        // 일반 응답
        return {
          choices: [
            {
              message: { content: response },
            },
          ],
        }
      },
    },
  },
}
