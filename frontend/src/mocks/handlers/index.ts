import { userHandlers } from './users'
import { guideHandlers } from './guides'
import { blockHandlers } from './blocks'
import { aiHandlers } from './ai'

export const handlers = [
  ...userHandlers,
  ...guideHandlers,
  ...blockHandlers,
  ...aiHandlers,
]
