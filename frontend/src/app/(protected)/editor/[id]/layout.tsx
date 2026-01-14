export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 에디터는 자체 레이아웃을 사용하므로 children만 렌더링
  return <>{children}</>
}
