/**
 * Zustand 스토어 모듈
 *
 * 이 파일에서 모든 스토어를 중앙 집중적으로 내보냅니다.
 *
 * 스토어 구조:
 * - useAuthStore: 사용자 인증 및 프로필 상태 관리
 * - useEditorStore: 에디터 UI 및 가이드 편집 상태 관리
 */

// Auth Store - 사용자 인증 및 프로필
export {
  useAuthStore,
  selectUser,
  selectIsLoading,
  selectError,
  selectLicense,
  selectIsPremium,
} from './auth'

// Editor Store - 가이드 에디터
export {
  useEditorStore,
  BLOCK_TYPE_META,
  type Block,
  type BlockType,
  type Guide,
  type EditorViewMode,
  type EditorPanelType,
  type SaveStatus,
} from './editor'
