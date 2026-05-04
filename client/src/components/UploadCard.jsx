import { useState, useRef, useCallback } from 'react'

export default function UploadCard({
  id,
  title,
  subtitle,
  icon,
  accentColor,
  buttonLabel,
  onAnalyze,
  isLoading,
}) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  const handleFile = useCallback((f) => {
    setError(null)
    if (!f) return
    if (!ALLOWED.includes(f.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(f)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer?.files?.[0])
  }, [handleFile])

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback(() => setDragOver(false), [])
  const handleClick = () => inputRef.current?.click()
  const handleChange = (e) => handleFile(e.target.files?.[0])

  const clearImage = (e) => {
    e.stopPropagation()
    setFile(null)
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleAnalyze = () => {
    if (!file) { setError('Please upload an image first.'); return }
    setError(null)
    onAnalyze(file)
  }

  return (
    <div className="glass-card overflow-hidden animate-slide-up" id={id}>
      {/* Card header with accent stripe */}
      <div className="px-7 pt-7 pb-0">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: accentColor === 'amber'
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: accentColor === 'amber'
                ? '0 4px 14px rgba(245,158,11,0.25)'
                : '0 4px 14px rgba(16,185,129,0.25)',
            }}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white leading-snug">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="px-7 pb-7">
        {/* Upload zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-image' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label="Upload image"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleChange}
            id={`${id}-file-input`}
          />

          {preview ? (
            <div className="relative w-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-60 object-contain rounded-xl"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center truncate">
                {file?.name}
              </p>
            </div>
          ) : (
            <>
              {/* Upload icon circle */}
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Drag and drop your crop image
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  or click to browse files from your device
                </p>
              </div>
              {/* Choose File pill button */}
              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                className="px-5 py-2 rounded-full border-[1.5px] border-emerald-400 text-emerald-700 dark:text-emerald-300 dark:border-emerald-500/40 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                Choose File
              </button>
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-2.5 rounded-xl animate-fade-in" role="alert">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        {/* Action button */}
        <button
          id={`${id}-analyze-btn`}
          className="btn-primary w-full mt-5 text-base"
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              {buttonLabel}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
