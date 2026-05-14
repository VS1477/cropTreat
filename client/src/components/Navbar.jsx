import { useState } from 'react'

export default function Navbar({ darkMode, setDarkMode, historyCount, onToggleHistory }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: darkMode ? 'rgba(7,16,13,0.9)' : 'rgba(255,255,255,0.84)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: darkMode ? '1px solid rgba(45,212,191,0.12)' : '1px solid rgba(226,232,240,0.76)',
      }}
    >
      <div className="page-container">
        <div className="flex h-[68px] items-center justify-between">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #047857, #0f766e)' }}
            >
              CH
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Crop <span className="text-emerald-600 dark:text-emerald-400">Treat</span>
            </span>
          </button>

          <div className="hidden items-center gap-1 md:flex">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Analyze', id: 'analyze' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              id="history-toggle-btn"
              onClick={onToggleHistory}
              className="relative rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
              title="Scan History"
              aria-label="Scan History"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {historyCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #047857, #0f766e)' }}
                >
                  {historyCount}
                </span>
              )}
            </button>

            <button
              id="dark-mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>

          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="space-y-1 pb-4 animate-fade-in md:hidden">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Analyze', id: 'analyze' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-emerald-900/20"
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { onToggleHistory(); setMobileOpen(false) }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                History ({historyCount})
              </button>
              <button
                onClick={() => { setDarkMode(!darkMode); setMobileOpen(false) }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
