interface Props {
  isActive: boolean
}

export default function JarvisAnimation({ isActive }: Props) {
  return (
    <div className={`jarvis-container ${isActive ? 'active' : ''}`}>
      {/* 외부 링 */}
      <div className="jarvis-ring ring-outer" />
      <div className="jarvis-ring ring-outer2" />

      {/* 중간 링 */}
      <div className="jarvis-ring ring-mid" />
      <div className="jarvis-ring ring-mid2" />

      {/* 내부 링 */}
      <div className="jarvis-ring ring-inner" />

      {/* 회전 아크 */}
      <div className="jarvis-arc arc-1" />
      <div className="jarvis-arc arc-2" />
      <div className="jarvis-arc arc-3" />
      <div className="jarvis-arc arc-4" />

      {/* 중앙 코어 */}
      <div className="jarvis-core">
        <div className="core-inner" />
        <div className="core-pulse" />
      </div>

      {/* 데이터 도트 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="jarvis-dot"
          style={{ '--i': i } as React.CSSProperties}
        />
      ))}

      {/* 스캔 라인 */}
      <div className="scan-line" />

      {/* 텍스트 */}
      <div className="jarvis-label">
        {isActive ? 'SPEAKING' : 'STANDBY'}
      </div>
    </div>
  )
}
