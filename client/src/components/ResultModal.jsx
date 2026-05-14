import { useEffect, useRef } from 'react'

export default function ResultModal({ isOpen, onClose, data, type, imageUrl, darkMode }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !data) return null

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose() }

  const isDiseaseType = type === 'disease'
  const isPositive = isDiseaseType ? data.is_healthy : !data.is_weed
  const resultLabel = isDiseaseType ? data.disease : (data.weed_type || data.result)
  const cropInfo = isDiseaseType && data.crop
    ? data.crop.charAt(0).toUpperCase() + data.crop.slice(1)
    : null

  const confidenceColor = data.confidence >= 85
    ? 'from-emerald-500 to-emerald-400'
    : data.confidence >= 60
      ? 'from-amber-500 to-yellow-400'
      : 'from-red-500 to-orange-400'

  const panelMessage = isDiseaseType
    ? {
        show: isPositive || data.treatment,
        title: isPositive ? 'Great News' : 'Treatment Suggestion',
        body: isPositive
          ? 'Your crop appears to be healthy. Continue regular monitoring and good agricultural practices.'
          : data.treatment,
        tone: isPositive ? 'green' : 'amber',
      }
    : {
        show: (!data.is_weed) || data.treatment,
        title: data.is_weed ? 'Weed Management' : 'No Weed Detected',
        body: data.is_weed
          ? data.treatment
          : 'The uploaded image appears to be a healthy crop with no weed presence. Continue regular field monitoring.',
        tone: data.is_weed ? 'orange' : 'green',
      }

  const toneStyle = {
    green: {
      background: darkMode
        ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))'
        : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
      border: darkMode ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(16,185,129,0.24)',
      title: darkMode ? '#6ee7b7' : '#047857',
      body: darkMode ? '#a7f3d0' : '#065f46',
    },
    amber: {
      background: darkMode
        ? 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))'
        : 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.05))',
      border: darkMode ? '1px solid rgba(251,191,36,0.18)' : '1px solid rgba(251,191,36,0.28)',
      title: darkMode ? '#fbbf24' : '#92400e',
      body: darkMode ? '#fde68a' : '#92400e',
    },
    orange: {
      background: darkMode
        ? 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.04))'
        : 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.05))',
      border: darkMode ? '1px solid rgba(249,115,22,0.18)' : '1px solid rgba(249,115,22,0.28)',
      title: darkMode ? '#fb923c' : '#9a3412',
      body: darkMode ? '#fed7aa' : '#9a3412',
    },
  }[panelMessage.tone]

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-end justify-center p-3 animate-fade-in sm:items-center sm:p-4"
      style={{
        background: darkMode ? 'rgba(0,0,0,0.68)' : 'rgba(15,23,42,0.52)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Analysis Result"
    >
      <div
        className="max-h-[92svh] w-full max-w-lg overflow-hidden rounded-lg animate-scale-in"
        style={{
          background: darkMode ? 'rgba(13,20,30,0.96)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          border: darkMode ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(226,232,240,0.72)',
          boxShadow: darkMode
            ? '0 25px 60px rgba(0,0,0,0.62), 0 0 1px rgba(16,185,129,0.2)'
            : '0 25px 60px rgba(15,23,42,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5"
          style={{
            background: isPositive
              ? 'linear-gradient(135deg, #047857, #0f766e)'
              : 'linear-gradient(135deg, #dc2626, #991b1b)',
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 sm:h-11 sm:w-11">
              <span className="text-sm font-extrabold text-white">{isDiseaseType ? 'DS' : 'WD'}</span>
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-bold text-white sm:text-lg">
                {isDiseaseType ? 'Disease Analysis' : 'Weed Detection'}
              </h3>
              {cropInfo && (
                <p className="truncate text-xs font-medium text-white/80">Detected crop: {cropInfo}</p>
              )}
              {!isDiseaseType && data.weed_type && (
                <p className="truncate text-xs font-medium text-white/80">Weed type: {data.weed_type}</p>
              )}
            </div>
          </div>
          <button
            id="result-modal-close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close result"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(92svh-142px)] space-y-5 overflow-y-auto p-4 sm:p-6">
          {imageUrl && (
            <div
              className="overflow-hidden rounded-lg border"
              style={{
                borderColor: darkMode ? 'rgba(16,185,129,0.1)' : 'rgba(226,232,240,0.8)',
                background: darkMode ? 'rgba(0,0,0,0.3)' : '#f8fafc',
              }}
            >
              <img src={imageUrl} alt="Analyzed" className="max-h-52 w-full object-contain sm:max-h-56" />
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p
                className="mb-1 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: darkMode ? 'rgba(148,163,184,0.8)' : '#64748b' }}
              >
                Result
              </p>
              <p
                className="break-words font-display text-xl font-extrabold sm:text-2xl"
                style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}
              >
                {resultLabel}
              </p>
            </div>
            <span className={`status-badge ${
              isDiseaseType
                ? (isPositive ? 'status-healthy' : 'status-diseased')
                : (isPositive ? 'status-crop' : 'status-weed')
            }`}>
              <span
                className={`h-2 w-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={darkMode ? { boxShadow: isPositive ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(239,68,68,0.5)' } : {}}
              />
              {isDiseaseType
                ? (isPositive ? 'Healthy' : 'Diseased')
                : (data.is_weed ? 'Weed' : 'Crop')}
            </span>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: darkMode ? 'rgba(148,163,184,0.8)' : '#64748b' }}
              >
                Confidence
              </p>
              <p className="font-display text-lg font-bold" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>
                {data.confidence}%
              </p>
            </div>
            <div className="confidence-bar">
              <div
                className={`confidence-fill bg-gradient-to-r ${confidenceColor}`}
                style={{
                  width: `${data.confidence}%`,
                  boxShadow: darkMode ? '0 0 12px rgba(16,185,129,0.3)' : 'none',
                }}
              />
            </div>
          </div>

          {panelMessage.show && panelMessage.body && (
            <div
              className="rounded-lg p-4 animate-fade-in sm:p-5"
              style={{
                background: toneStyle.background,
                border: toneStyle.border,
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0" style={{ color: toneStyle.title }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="text-sm font-bold" style={{ color: toneStyle.title }}>{panelMessage.title}</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: toneStyle.body }}>{panelMessage.body}</p>
            </div>
          )}
        </div>

        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <button onClick={onClose} className="btn-primary w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
