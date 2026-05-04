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
  const resultLabel = isDiseaseType ? data.disease : data.result
  const cropInfo = isDiseaseType && data.crop
    ? data.crop.charAt(0).toUpperCase() + data.crop.slice(1)
    : null

  const confidenceColor = data.confidence >= 85
    ? 'from-emerald-500 to-emerald-400'
    : data.confidence >= 60
      ? 'from-amber-500 to-yellow-400'
      : 'from-red-500 to-orange-400'

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: darkMode ? 'rgba(0,0,0,0.65)' : 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Analysis Result"
    >
      <div
        className="w-full max-w-lg overflow-hidden animate-scale-in"
        style={{
          background: darkMode ? 'rgba(13,20,30,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          border: darkMode ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(226,232,240,0.6)',
          boxShadow: darkMode
            ? '0 25px 60px rgba(0,0,0,0.6), 0 0 1px rgba(16,185,129,0.2), 0 0 40px rgba(16,185,129,0.04)'
            : '0 25px 60px rgba(0,0,0,0.15), 0 4px 14px rgba(16,185,129,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            background: isPositive
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #ef4444, #dc2626)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <span className="text-xl">
                {isDiseaseType
                  ? (isPositive ? '✅' : '🦠')
                  : (isPositive ? '🌾' : '🌿')
                }
              </span>
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-lg">
                {isDiseaseType ? 'Disease Analysis' : 'Weed Detection'}
              </h3>
              {cropInfo && (
                <p className="text-white/80 text-xs font-medium">Detected crop: {cropInfo}</p>
              )}
            </div>
          </div>
          <button
            id="result-modal-close"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image preview */}
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden border"
              style={{
                borderColor: darkMode ? 'rgba(16,185,129,0.1)' : 'rgba(226,232,240,0.8)',
                background: darkMode ? 'rgba(0,0,0,0.3)' : '#f8fafc',
              }}>
              <img src={imageUrl} alt="Analyzed" className="w-full max-h-56 object-contain" />
            </div>
          )}

          {/* Result */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: darkMode ? 'rgba(148,163,184,0.8)' : '#94a3b8' }}>Result</p>
              <p className="font-display font-extrabold text-2xl"
                style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>{resultLabel}</p>
            </div>
            <span className={`status-badge ${
              isDiseaseType
                ? (isPositive ? 'status-healthy' : 'status-diseased')
                : (isPositive ? 'status-crop' : 'status-weed')
            }`}>
              <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={darkMode ? { boxShadow: isPositive ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(239,68,68,0.5)' } : {}} />
              {isDiseaseType
                ? (isPositive ? 'Healthy' : 'Diseased')
                : (data.is_weed ? 'Weed' : 'Crop')
              }
            </span>
          </div>

          {/* Confidence bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: darkMode ? 'rgba(148,163,184,0.8)' : '#94a3b8' }}>Confidence</p>
              <p className="font-display font-bold text-lg"
                style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>{data.confidence}%</p>
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

          {/* Treatment — disease only */}
          {isDiseaseType && !isPositive && data.treatment && (
            <div className="rounded-2xl p-5 animate-fade-in"
              style={{
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.03))'
                  : 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))',
                border: darkMode
                  ? '1px solid rgba(251,191,36,0.15)'
                  : '1px solid rgba(251,191,36,0.2)',
              }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💊</span>
                <p className="font-bold text-sm" style={{ color: darkMode ? '#fbbf24' : '#92400e' }}>Treatment Suggestion</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: darkMode ? '#fcd34d' : '#a16207' }}>{data.treatment}</p>
            </div>
          )}

          {/* Healthy message */}
          {isDiseaseType && isPositive && (
            <div className="rounded-2xl p-5 animate-fade-in"
              style={{
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(5,150,105,0.03))'
                  : 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
                border: darkMode
                  ? '1px solid rgba(16,185,129,0.15)'
                  : '1px solid rgba(16,185,129,0.2)',
              }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎉</span>
                <p className="font-bold text-sm" style={{ color: darkMode ? '#34d399' : '#065f46' }}>Great News!</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: darkMode ? '#6ee7b7' : '#047857' }}>
                Your crop appears to be healthy. Continue regular monitoring and good agricultural practices.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button onClick={onClose} className="btn-primary w-full text-base">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
