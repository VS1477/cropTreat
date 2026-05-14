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
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="mb-5 flex items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold text-white sm:h-12 sm:w-12"
            style={{
              background: accentColor === 'amber'
                ? 'linear-gradient(135deg, #d97706, #92400e)'
                : 'linear-gradient(135deg, #047857, #0f766e)',
              boxShadow: accentColor === 'amber'
                ? '0 4px 14px rgba(245,158,11,0.25)'
                : '0 4px 14px rgba(16,185,129,0.25)',
            }}>
            <span>{icon}</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold leading-snug text-slate-950 dark:text-white sm:text-xl">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
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
                className="max-h-56 w-full rounded-md object-contain sm:max-h-64"
              />
              <button
                onClick={clearImage}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="mt-3 truncate text-center text-xs text-slate-500 dark:text-slate-400">
                {file?.name}
              </p>
            </div>
          ) : (
            <>
              {/* Upload icon circle */}
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Drag and drop your crop image
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  or click to browse files from your device
                </p>
              </div>
              {/* Choose File pill button */}
              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                className="btn-secondary"
              >
                Choose File
              </button>
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 animate-fade-in dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300" role="alert">
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
              Analyzing...
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
