import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import UploadCard from './components/UploadCard'
import ResultModal from './components/ResultModal'
import HistoryPanel from './components/HistoryPanel'
import Footer from './components/Footer'

const API_BASE = '/api'

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
    <div className="min-h-screen bg-section transition-colors duration-300 relative">
      {/* Atmospheric dark mode glow blobs */}
      <div className="dark-glow-tl" />
      <div className="dark-glow-br" />
      <div className="dark-glow-center" />

      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        historyCount={history.length}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
      />

      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section id="hero" className="relative overflow-hidden bg-hero min-h-[90vh] flex items-center">
        {/* ─── Background Video ─── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: darkMode ? 'brightness(0.3)' : 'none' }}
        >
          <source src="/images/hero-farm.mp4" type="video/mp4" />
        </video>

        {/* ─── Gradient overlay on top of video ─── */}
        <div className="absolute inset-0 z-[1]" style={{
          background: darkMode
            ? 'linear-gradient(180deg, rgba(7,11,16,0.55) 0%, rgba(7,11,16,0.85) 70%, rgba(7,11,16,1) 100%)'
            : `
              linear-gradient(180deg, rgba(238,242,247,0.35) 0%, rgba(238,242,247,0.6) 50%, rgba(238,242,247,0.95) 100%),
              radial-gradient(circle at 6% 0%, rgba(167,243,208,0.42), transparent 28%),
              radial-gradient(circle at 90% 20%, rgba(16,185,129,0.12), transparent 30%)
            `,
        }} />

        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — text content */}
            <div className="animate-slide-up">
              <div className="glass-card p-8 sm:p-10" style={{ borderRadius: '2rem' }}>
                <span className="section-badge mb-6 inline-block">AI Crop Disease Detection Platform</span>

                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.4rem] text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                  Detect Crop{' '}
                  <br className="hidden sm:block" />
                  Diseases Using{' '}
                  <span className="text-gradient">AI</span>
                </h1>

                <div className="mt-6 glass-card p-5" style={{ borderRadius: '1.25rem' }}>
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    Crop Treat helps farmers and agribusiness teams identify crop diseases in seconds
                    with intelligent image analysis, actionable treatment insights, and a simple
                    workflow designed for real field conditions.
                  </p>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3 mt-7">
                  <button onClick={scrollToAnalyze} className="btn-primary text-base px-8">
                    Upload Image
                  </button>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-secondary text-base"
                  >
                    Learn More
                  </button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 mt-8">
                  {[
                    { value: '98.2%', label: 'Detection Accuracy' },
                    { value: '2.5s', label: 'Average Result Time' },
                    { value: '30+', label: 'Disease Patterns' },
                  ].map((stat) => (
                    <div key={stat.label} className="glass-card p-4 text-center" style={{ borderRadius: '1rem' }}>
                      <p className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">{stat.value}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Live Analysis Panel */}
            <div className="hidden lg:block animate-slide-up delay-200">
              <div className="glass-card p-7 animate-float" style={{
                borderRadius: '2rem',
              }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Live Analysis Panel</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    Active
                  </span>
                </div>

                {/* Mock disease bars */}
                {[
                  { name: 'Leaf Spot', conf: 94 },
                  { name: 'Early Blight', conf: 87 },
                  { name: 'Rust', conf: 73 },
                ].map((item) => (
                  <div key={item.name} className="inner-panel mb-4 p-4 rounded-xl border border-slate-100 dark:border-emerald-500/15 transition-colors"
                    style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{item.conf}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden"
                      style={{ background: darkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${item.conf}%`,
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                          boxShadow: darkMode ? '0 0 12px rgba(16,185,129,0.3)' : 'none',
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Bottom workflow icons */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { icon: '📷', label: 'Leaf Scan' },
                    { icon: '📊', label: 'Result' },
                    { icon: '⭐', label: 'Treatment' },
                  ].map((step) => (
                    <div key={step.label} className="inner-panel text-center p-3 rounded-xl border border-slate-100 dark:border-emerald-500/15 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/8 transition-colors"
                      style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)' }}>
                      <span className="text-xl">{step.icon}</span>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════ */}
      <section id="features" className="py-20 sm:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-slide-up">
            <span className="section-badge mb-5 inline-block">Features</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white leading-tight">
              Built for modern<br />precision agriculture
            </h2>
            <p className="mt-5 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Crop Treat combines AI speed with practical usability so growers can detect risk early and respond with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                ),
                title: 'AI Disease Detection',
                desc: 'Advanced vision models detect visible crop diseases from leaf patterns with high reliability.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                ),
                title: 'Instant Analysis',
                desc: 'Get diagnostic results and confidence scores in seconds to make faster field decisions.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                ),
                title: 'Farmer Friendly',
                desc: 'Simple upload flow built for real usage, from smartphones to desktop dashboards.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ),
                title: 'Accurate Results',
                desc: 'Trained models deliver precise detection outcomes to reduce crop loss and uncertainty.',
              },
            ].map((feature, i) => (
              <div key={feature.title} className={`feature-card animate-slide-up delay-${(i + 1) * 100}`}>
                <div className="icon-container w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS SECTION
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 sm:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-slide-up">
            <span className="section-badge mb-5 inline-block">How It Works</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white leading-tight">
              A simple workflow powered<br />by intelligent vision
            </h2>
            <p className="mt-5 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              From image upload to treatment guidance, Crop Treat keeps disease detection quick and intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: 1, icon: '📷', title: 'Upload Crop Image', desc: 'Capture or upload a clear photo of the affected crop leaf.' },
              { num: 2, icon: '🔄', title: 'AI Analyzes Leaf', desc: 'Our model scans visual disease markers and stress patterns.' },
              { num: 3, icon: '📊', title: 'Get Disease Result', desc: 'Receive a diagnosis with confidence indicators and labels.' },
              { num: 4, icon: '⭐', title: 'View Treatment', desc: 'Explore practical treatment guidance and preventive recommendations.' },
            ].map((step, i) => (
              <div key={step.num} className={`step-card animate-slide-up delay-${(i + 1) * 100}`}>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: darkMode ? '0 0 16px rgba(16,185,129,0.3)' : 'none',
                    }}>
                    {step.num}
                  </div>
                  <div className="icon-container w-9 h-9 rounded-xl flex items-center justify-center">
                    <span className="text-lg">{step.icon}</span>
                  </div>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ANALYZE SECTION
          ═══════════════════════════════════════════ */}
      <section id="analyze" className="py-20 sm:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-slide-up">
            <span className="section-badge mb-5 inline-block">Analyze</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white leading-tight">
              Crop image upload interface
            </h2>
            <p className="mt-5 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A clean drag-and-drop UI made for quick disease and weed detection workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <UploadCard
              id="disease-detection"
              title="Maize & Sugarcane Disease Detection"
              subtitle="Detect blight, rust, smut, and more across maize and sugarcane crops"
              icon="🌽"
              accentColor="green"
              buttonLabel="Analyze Disease"
              onAnalyze={analyzeDisease}
              isLoading={diseaseLoading}
            />
            <UploadCard
              id="weed-detection"
              title="Weed Detection"
              subtitle="Classify whether the image contains a weed or healthy crop"
              icon="🌿"
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
              className="max-w-sm w-full p-7 text-center animate-scale-in"
              style={{
                background: darkMode ? 'rgba(13,20,30,0.95)' : 'rgba(255,255,255,0.95)',
                borderRadius: '1.5rem',
                boxShadow: darkMode
                  ? '0 25px 60px rgba(0,0,0,0.5), 0 0 1px rgba(16,185,129,0.2)'
                  : '0 25px 60px rgba(0,0,0,0.15)',
                border: darkMode ? '1px solid rgba(16,185,129,0.1)' : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
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
