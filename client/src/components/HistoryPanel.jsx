export default function HistoryPanel({ isOpen, onClose, history, onClear, darkMode }) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 animate-fade-in lg:hidden"
        style={{
          background: darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] shadow-2xl transform transition-transform duration-300"
        style={{
          background: darkMode ? 'rgba(10,15,22,0.97)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: darkMode ? '1px solid rgba(16,185,129,0.1)' : '1px solid rgba(226,232,240,0.6)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: darkMode
            ? '-4px 0 30px rgba(0,0,0,0.4), 0 0 1px rgba(16,185,129,0.1)'
            : '-4px 0 20px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5"
          style={{
            borderBottom: darkMode ? '1px solid rgba(16,185,129,0.1)' : '1px solid rgba(226,232,240,0.8)',
          }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,78,59,0.2))'
                  : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
              }}>
              <svg className="w-4 h-4" style={{ color: darkMode ? '#34d399' : '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="font-display font-bold" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>Scan History</h3>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-red-500 hover:text-red-400 px-3 py-1.5 rounded-full transition-colors font-medium"
                style={{ ':hover': { background: darkMode ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)' } }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors"
              style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* History list */}
        <div className="overflow-y-auto h-[calc(100%-72px)] p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                    : 'linear-gradient(135deg, rgba(226,232,240,0.5), rgba(226,232,240,0.2))',
                }}>
                <svg className="w-7 h-7" style={{ color: darkMode ? '#334155' : '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: darkMode ? '#475569' : '#94a3b8' }}>No scans yet</p>
              <p className="text-xs mt-1" style={{ color: darkMode ? '#334155' : '#cbd5e1' }}>Upload an image to get started</p>
            </div>
          ) : (
            history.map((item, i) => {
              const isDiseaseType = item.type === 'disease'
              const isPositive = isDiseaseType ? item.data.is_healthy : !item.data.is_weed

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 animate-fade-in"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
                    border: darkMode ? '1px solid rgba(16,185,129,0.08)' : '1px solid rgba(241,245,249,1)',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(248,250,252,1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)'}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0"
                      style={{
                        border: darkMode ? '1px solid rgba(16,185,129,0.1)' : '1px solid #f1f5f9',
                      }} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl shrink-0"
                      style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }} />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={darkMode ? {
                          boxShadow: isPositive
                            ? '0 0 6px rgba(16,185,129,0.4)'
                            : '0 0 6px rgba(239,68,68,0.4)'
                        } : {}} />
                      <p className="text-sm font-semibold truncate"
                        style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                        {isDiseaseType ? item.data.disease : item.data.result}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase font-semibold tracking-wide"
                        style={{ color: darkMode ? '#475569' : '#94a3b8' }}>
                        {isDiseaseType ? '🌽 Disease' : '🌿 Weed'}
                      </span>
                      <span className="text-[10px] font-medium"
                        style={{ color: darkMode ? '#475569' : '#94a3b8' }}>
                        {item.data.confidence}%
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] shrink-0 font-medium"
                    style={{ color: darkMode ? '#334155' : '#94a3b8' }}>
                    {item.time}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}
