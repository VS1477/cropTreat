import { useState } from 'react'

export default function Navbar({ darkMode, setDarkMode, historyCount, onToggleHistory }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50" style={{
      background: darkMode ? 'rgba(7,11,16,0.85)' : 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: darkMode ? '1px solid rgba(16,185,129,0.08)' : '1px solid rgba(226,232,240,0.6)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              CH
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              Crop <span className="text-emerald-600 dark:text-emerald-400">Treat</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Features', id: 'features' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Analyze', id: 'analyze' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* History button */}
            <button
              id="history-toggle-btn"
              onClick={onToggleHistory}
              className="relative p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Scan History"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {historyCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {historyCount}
                </span>
              )}
            </button>

            {/* Dark mode */}
            <button
              id="dark-mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in">
            {['Home:hero', 'Features:features', 'How It Works:how-it-works', 'Analyze:analyze'].map((item) => {
              const [label, id] = item.split(':')
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  {label}
                </button>
              )
            })}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { onToggleHistory(); setMobileOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                📋 History ({historyCount})
              </button>
              <button
                onClick={() => { setDarkMode(!darkMode); setMobileOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
