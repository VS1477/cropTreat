export default function Footer() {
  return (
    <footer className="relative z-10 py-10 border-t border-slate-200/60 dark:border-emerald-500/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              CH
            </div>
            <span className="font-display font-bold text-base text-slate-900 dark:text-white">
              Crop <span className="text-emerald-600 dark:text-emerald-400">Treat</span>
            </span>
          </div>

          <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-md leading-relaxed">
            AI-powered crop disease and weed detection for maize & sugarcane.
            Built for smarter, modern agriculture 🌱
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} CropHealthAI
          </p>
        </div>
      </div>
    </footer>
  )
}
