export default function HistoryPanel({ isOpen, onClose, history, onClear, darkMode }) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{
          background: darkMode ? 'rgba(0,0,0,0.54)' : 'rgba(15,23,42,0.42)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-sm shadow-2xl sm:w-96"
        style={{
          background: darkMode ? 'rgba(10,20,17,0.98)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: darkMode ? '1px solid rgba(45,212,191,0.14)' : '1px solid rgba(226,232,240,0.76)',
          boxShadow: darkMode
            ? '-8px 0 34px rgba(0,0,0,0.42)'
            : '-8px 0 28px rgba(15,23,42,0.10)',
        }}
      >
        <div
          className="flex items-center justify-between gap-3 p-4 sm:p-5"
          style={{
            borderBottom: darkMode ? '1px solid rgba(45,212,191,0.12)' : '1px solid rgba(226,232,240,0.8)',
          }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: darkMode ? 'rgba(20,184,166,0.14)' : 'rgba(20,184,166,0.1)',
              }}
            >
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="truncate font-display font-bold text-slate-950 dark:text-white">Scan History</h3>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
              aria-label="Close history"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-73px)] space-y-2.5 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(226,232,240,0.58)',
                }}
              >
                <svg className="h-7 w-7 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-500">No scans yet</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">Upload an image to get started</p>
            </div>
          ) : (
            history.map((item, i) => {
              const isDiseaseType = item.type === 'disease'
              const isPositive = isDiseaseType ? item.data.is_healthy : !item.data.is_weed

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3 animate-fade-in"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(248,250,252,0.82)',
                    borderColor: darkMode ? 'rgba(45,212,191,0.1)' : 'rgba(226,232,240,0.9)',
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      style={{
                        border: darkMode ? '1px solid rgba(45,212,191,0.12)' : '1px solid #e2e8f0',
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 dark:bg-white/5" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {isDiseaseType ? item.data.disease : (item.data.weed_type || item.data.result)}
                      </p>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {isDiseaseType ? 'Disease' : 'Weed'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {item.data.confidence}%
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-600">
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
