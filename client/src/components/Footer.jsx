export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200/70 py-8 dark:border-emerald-500/10 sm:py-10">
      <div className="page-container">
        <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #047857, #0f766e)' }}
            >
              CH
            </div>
            <span className="font-display text-base font-bold text-slate-950 dark:text-white">
              Crop <span className="text-emerald-600 dark:text-emerald-400">Treat</span>
            </span>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            AI-powered crop disease and weed detection for maize and sugarcane.
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-600">
            (c) {new Date().getFullYear()} Crop Treat
          </p>
        </div>
      </div>
    </footer>
  )
}
