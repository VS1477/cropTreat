import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import UploadCard from './components/UploadCard'
import ResultModal from './components/ResultModal'
import HistoryPanel from './components/HistoryPanel'
import Footer from './components/Footer'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function App() {
  // --- Dark mode ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crophealth-dark')
      if (saved !== null) return saved === 'true'
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    }
    return false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('crophealth-dark', darkMode)
  }, [darkMode])

  // --- Loading states ---
  const [diseaseLoading, setDiseaseLoading] = useState(false)
  const [weedLoading, setWeedLoading] = useState(false)

  // --- Modal state ---
  const [modal, setModal] = useState({ open: false, data: null, type: null, imageUrl: null })

  // --- History ---
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('crophealth-history')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('crophealth-history', JSON.stringify(history.slice(0, 50)))
  }, [history])

  const addToHistory = useCallback((type, data, imageUrl) => {
    const entry = {
      type,
      data,
      imageUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setHistory((prev) => [entry, ...prev].slice(0, 50))
  }, [])

  // --- API calls (unchanged logic) ---
  const analyzeDisease = useCallback(async (file) => {
    setDiseaseLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API_BASE}/predict-disease`, { method: 'POST', body: formData })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `Server error (${res.status})`)
      }
      const data = await res.json()
      const imageUrl = URL.createObjectURL(file)
      setModal({ open: true, data, type: 'disease', imageUrl })
      addToHistory('disease', data, imageUrl)
    } catch (err) {
      setModal({
        open: true,
        data: { error: true, message: err.message || 'Failed to analyze image. Please try again.' },
        type: 'error',
        imageUrl: null,
      })
    } finally {
      setDiseaseLoading(false)
    }
  }, [addToHistory])

  const analyzeWeed = useCallback(async (file) => {
    setWeedLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API_BASE}/predict-weed`, { method: 'POST', body: formData })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `Server error (${res.status})`)
      }
      const data = await res.json()
      const imageUrl = URL.createObjectURL(file)
      setModal({ open: true, data, type: 'weed', imageUrl })
      addToHistory('weed', data, imageUrl)
    } catch (err) {
      setModal({
        open: true,
        data: { error: true, message: err.message || 'Failed to analyze image. Please try again.' },
        type: 'error',
        imageUrl: null,
      })
    } finally {
      setWeedLoading(false)
    }
  }, [addToHistory])

  const closeModal = () => setModal({ open: false, data: null, type: null, imageUrl: null })

  const scrollToAnalyze = () => {
    document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app-shell bg-section">
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        historyCount={history.length}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
      />

      {/* Hero section */}
      <section id="hero" className="relative flex min-h-[calc(100svh-68px)] items-end overflow-hidden">
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          style={{ filter: darkMode ? 'brightness(0.42) saturate(0.95)' : 'brightness(0.82) saturate(1.04)' }}
        >
          <source src="/images/hero-farm.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay on top of video */}
        <div className="absolute inset-0 z-[1]" style={{
          background: darkMode
            ? 'linear-gradient(180deg, rgba(7,16,13,0.18) 0%, rgba(7,16,13,0.7) 72%, #07100d 100%)'
            : 'linear-gradient(180deg, rgba(7,16,13,0.12) 0%, rgba(7,16,13,0.4) 68%, rgba(247,250,246,0.98) 100%)',
        }} />

        <div className="page-container relative z-[2] pb-14 pt-28 sm:pb-20 lg:pb-24">
          <div className="max-w-3xl animate-slide-up">
            <span className="section-badge mb-4">Crop Treat</span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Diagnose crop disease and identify weed threats.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
              Upload field images for maize, sugarcane, and weed analysis with a responsive workflow that works from phone to desktop.
            </p>
            <button onClick={scrollToAnalyze} className="btn-primary mt-8 w-full sm:w-auto sm:px-8">
              Analyze
            </button>
          </div>
        </div>
      </section>



      {/* Analyze section */}
      <section id="analyze" className="relative z-10 py-14 sm:py-20 lg:py-24">
        <div className="page-container">
          <div className="mb-10 max-w-3xl animate-slide-up sm:mb-12">
            <span className="section-badge mb-4 inline-block">Analyze</span>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Crop image upload interface
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              A clean drag-and-drop UI made for quick disease and weed detection workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <UploadCard
              id="disease-detection"
              title="Maize & Sugarcane Disease Detection"
              subtitle="Detect blight, rust, smut, and more across maize and sugarcane crops"
              icon="DS"
              accentColor="green"
              buttonLabel="Analyze Disease"
              onAnalyze={analyzeDisease}
              isLoading={diseaseLoading}
            />
            <UploadCard
              id="weed-detection"
              title="Weed Detection"
              subtitle="Classify whether the image contains a weed or healthy crop"
              icon="WD"
              accentColor="amber"
              buttonLabel="Detect Weed"
              onAnalyze={analyzeWeed}
              isLoading={weedLoading}
            />
          </div>
        </div>
      </section>

      <Footer />

      {/* Result Modal */}
      {modal.type === 'error' ? (
        modal.open && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
            style={{
              background: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.5)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={closeModal}
          >
            <div
              className="w-full max-w-sm rounded-lg border p-6 text-center animate-scale-in sm:p-7"
              style={{
                background: darkMode ? 'rgba(13,20,30,0.95)' : 'rgba(255,255,255,0.95)',
                boxShadow: darkMode
                  ? '0 25px 60px rgba(0,0,0,0.5), 0 0 1px rgba(16,185,129,0.2)'
                  : '0 25px 60px rgba(0,0,0,0.15)',
                borderColor: darkMode ? 'rgba(16,185,129,0.1)' : 'rgba(226,232,240,0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))' }}>
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">Analysis Failed</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{modal.data?.message}</p>
              <button onClick={closeModal} className="btn-primary w-full text-base">Close</button>
            </div>
          </div>
        )
      ) : (
        <ResultModal
          isOpen={modal.open}
          onClose={closeModal}
          data={modal.data}
          type={modal.type}
          imageUrl={modal.imageUrl}
          darkMode={darkMode}
        />
      )}

      {/* History Panel */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onClear={() => { setHistory([]); localStorage.removeItem('crophealth-history') }}
        darkMode={darkMode}
      />
    </div>
  )
}
