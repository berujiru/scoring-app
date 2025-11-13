import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { judgingApi, judgesApi } from '../api/client'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ErrorBoundary } from 'react-error-boundary'

interface Tally {
  eventId: number
  judges: Array<{ id: number; name: string }>
  tallies: Array<{
    contestantId: number
    contestantName: string
    totalScore: number
    criteriaBreakdown: Array<{
      criteriaId: number
      criteriaName: string
      percentage: number
      averageScore: number
      weightedScore: number
      scoresCount: number
      judgeScores?: { [judgeId: number]: number }
    }>
    judgeOverallScores: { [judgeId: number]: { scores: number[]; average: number } }
  }>
  criteria: Array<{
    id: number
    name: string
    percentage: number
  }>
}

// Error boundary fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div role="alert" className="p-6 max-w-2xl mx-auto mt-10 bg-red-50 rounded-lg border border-red-200">
      <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
      <pre className="mt-2 p-4 bg-white rounded text-red-700 text-sm overflow-auto">
        {error.message}
      </pre>
      <div className="mt-4">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export default EventRankingsWithErrorBoundary

// Main component with error boundary
function EventRankingsWithErrorBoundary() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <EventRankings />
    </ErrorBoundary>
  )
}

function EventRankings() {
  const { id } = useParams<{ id: string }>()
  const [tally, setTally] = useState<Tally | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedContestantId, setExpandedContestantId] = useState<number | null>(null)
  const [judges, setJudges] = useState<Array<{ id: number; name: string }>>([])
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [revealRankings, setRevealRankings] = useState(false)
  const [revealedRanks, setRevealedRanks] = useState<number[]>([])
  const printableRef = useRef<HTMLDivElement | null>(null)
  const confettiRef = useRef<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [highlightRank, setHighlightRank] = useState<number | null>(null)
  
  // Initialize refs for rank tracking
  const EPS = 1e-6
  const ranksMapRef = useRef<Record<number, number>>({})
  const tiedMapRef = useRef<Record<number, boolean>>({})
  const rankToContestantIdsRef = useRef<Record<number, number[]>>({})
  
 

  const handleDownloadPdf = async () => {
    const el = printableRef.current
    if (!el) {
      // Fallback to print
      window.print()
      return
    }

    try {
  // Dynamically import html2pdf to avoid forcing users to install it if they don't need downloads.
  // Install with: npm install html2pdf.js
  // Suppress TS error when types aren't present for the package
  // @ts-ignore
  const imported = await import('html2pdf.js')
      // html2pdf may be the default export or the module itself
      const html2pdf: any = imported.default || imported

      const opt = {
        margin:       0.4,
        filename:     `Event-${id || 'unknown'}-Rankings.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      }

      // html2pdf usage: html2pdf().from(element).set(options).save()
      // some bundles export a factory function directly
      const runner = typeof html2pdf === 'function' ? html2pdf() : (html2pdf as any).default()
      runner.from(el).set(opt).save()
    } catch (err) {
      // If import or generation fails, fallback to the browser print dialog
      // This keeps behavior working even without the dependency installed.
      // eslint-disable-next-line no-console
      console.error('PDF generation failed, falling back to print():', err)
      window.print()
    }
  }

  useEffect(() => {
    const fetchTally = async () => {
      if (!id) return
      setIsLoading(true)
      setError(null)
      try {
        const response = await judgingApi.getTallyByEvent(parseInt(id))
        setTally(response.data)
        setLastUpdated(new Date())
        // Judges are now included in the tally response
        if (response.data.judges) {
          setJudges(response.data.judges)
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch rankings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTally()
  }, [id])

  

  // Use ref objects directly (avoid destructuring snapshots)
  
  // Get the sorted tallies from memo
  const sortedTallies = useMemo(() => {
    if (!tally?.tallies) return []
    
    const sorted = [...tally.tallies].sort((a, b) => b.totalScore - a.totalScore)
    
    // Reset maps without changing object identity
    Object.keys(ranksMapRef.current).forEach(k => delete ranksMapRef.current[Number(k)])
    Object.keys(tiedMapRef.current).forEach(k => delete tiedMapRef.current[Number(k)])
    Object.keys(rankToContestantIdsRef.current).forEach(k => delete rankToContestantIdsRef.current[Number(k)])
    
    // Calculate ranks
    if (sorted.length > 0) {
      let prevScore = NaN
      let prevRank = 0
      let prevId: number | null = null
      
      for (let i = 0; i < sorted.length; i++) {
        const c = sorted[i]
        const s = c.totalScore
        
        if (i === 0) {
          ranksMapRef.current[c.contestantId] = 1
          prevScore = s
          prevRank = 1
          prevId = c.contestantId
          rankToContestantIdsRef.current[1] = [c.contestantId]
        } else {
          if (Math.abs(s - prevScore) <= EPS) {
            // tie with previous
            ranksMapRef.current[c.contestantId] = prevRank
            tiedMapRef.current[c.contestantId] = true
            if (prevId != null) tiedMapRef.current[prevId] = true
            rankToContestantIdsRef.current[prevRank].push(c.contestantId)
          } else {
            const rank = i + 1
            ranksMapRef.current[c.contestantId] = rank
            prevRank = rank
            rankToContestantIdsRef.current[rank] = [c.contestantId]
          }
          prevScore = s
          prevId = c.contestantId
        }
      }
    }
    
    return sorted
  }, [tally, EPS])

  // Only show contestants whose ranks have been revealed (top 3 only)
  const visibleTallies = useMemo(() => {
    if (!revealRankings) return []
    return sortedTallies.filter(c => {
      const r = ranksMapRef.current[c.contestantId]
      return r <= 3 && revealedRanks.includes(r)
    })
  }, [revealRankings, revealedRanks, sortedTallies])

  // Sorted list of actual rank numbers present (handles ties like 1,2,2,4 without a 3)
  const allRanks = useMemo(() => {
    const keys = Object.keys(rankToContestantIdsRef.current).map(Number).filter(n => n <= 3)
    keys.sort((a, b) => a - b)
    return keys
  }, [sortedTallies])

  // Reveal order (descending: e.g., 3 -> 2 -> 1)
  const revealOrder = useMemo(() => {
    const keys = Object.keys(rankToContestantIdsRef.current).map(Number).filter(n => n <= 3)
    keys.sort((a, b) => b - a)
    return keys
  }, [sortedTallies])

  const triggerConfetti = useCallback((rank: number) => {
    // Only trigger confetti for top 3 ranks
    if (rank > 3) return
    
    // Nude palettes by rank
    const gold = ['#D4AF37', '#F6E27A', '#B89000']
    const silver = ['#C0C0C0', '#E0E0E0', '#A9A9A9']
    const bronze = ['#CD7F32', '#E1A95F', '#A97142']
    const colors = rank === 1 ? gold : rank === 2 ? silver : bronze
    const end = Date.now() + 1400
    
    const interval = window.setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval)
        return
      }
      
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 1 },
        colors: colors,
      })
      
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 1 },
        colors: colors,
      })
    }, 220) as unknown as number
    
    confettiRef.current = interval
    
    // Auto-clear after animation
    setTimeout(() => {
      if (confettiRef.current) {
        clearInterval(confettiRef.current)
        confettiRef.current = null
      }
    }, 1700)
  }, [])

  const showRankHighlight = useCallback((rank: number) => {
    setHighlightRank(rank)
    // auto-hide after animation
    window.setTimeout(() => {
      setHighlightRank(null)
    }, 2800)
  }, [])
  
  const revealNextRank = useCallback(() => {
    if (!revealRankings) {
      setRevealRankings(true)
      const first = revealOrder[0]
      if (first !== undefined) {
        setRevealedRanks([first])
        triggerConfetti(first)
        showRankHighlight(first)
      }
      return
    }
    if (revealOrder.length === 0) return
    const next = revealOrder.find(r => !revealedRanks.includes(r))
    if (next !== undefined) {
      setRevealedRanks(prev => [...prev, next])
      triggerConfetti(next)
      showRankHighlight(next)
    }
  }, [revealRankings, revealedRanks, revealOrder, triggerConfetti, showRankHighlight])

  const revealAll = useCallback(() => {
    if (!revealRankings) setRevealRankings(true)
    setRevealedRanks(allRanks)
    if (allRanks.length) triggerConfetti(allRanks[0])
  }, [allRanks, revealRankings, triggerConfetti])
  
  const resetReveal = useCallback(() => {
    setRevealRankings(false)
    setRevealedRanks([])
  }, [])

  const isRevealed = (contestantId: number) => {
    if (!revealRankings) return false
    return revealedRanks.includes(ranksMapRef.current[contestantId])
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="text-gray-600">Loading rankings...</p>
        </div>
      </div>
    )
  }

  if (error || !tally) {
    return (
      <div className="space-y-4">
        <Link
          to={`/events/${id}`}
          className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm inline-flex"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Event
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error loading rankings</p>
          <p className="text-sm mt-1">{error || 'Unable to load rankings'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to={`/events/${id}`}
        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm inline-flex"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Event
      </Link>

      {/* Header with Print Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Rankings</h1>
          <p className="text-gray-600">Final scores and detailed breakdown by criteria</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">As of {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <button
          onClick={() => setShowPrintPreview(!showPrintPreview)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm2-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {showPrintPreview ? 'Hide Print' : 'Print'}
        </button>
      </div>

      {/* Highlight Overlay for Rank Reveal */}
      <AnimatePresence>
        {highlightRank !== null && (
          <motion.div
            key="rank-highlight"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center px-12 py-14 rounded-3xl shadow-2xl border"
              style={{
                backgroundColor: highlightRank === 1 ? '#FFF8E1' : highlightRank === 2 ? '#F7F7F7' : '#FFF1E6',
                borderColor: highlightRank === 1 ? '#F3D37A' : highlightRank === 2 ? '#D9D9D9' : '#E3B07A'
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.15, 1.05, 1], opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div
                className="text-5xl md:text-7xl font-black tracking-tight"
                style={{ color: highlightRank === 1 ? '#B8860B' : highlightRank === 2 ? '#7A7A7A' : '#8B5A2B' }}
              >
                Rank {highlightRank}
              </div>
              <div className="mt-5 text-2xl md:text-3xl font-semibold text-gray-900">
                {(() => {
                  const ids = rankToContestantIdsRef.current[highlightRank] || []
                  const names = sortedTallies
                    .filter(c => ids.includes(c.contestantId))
                    .map(c => c.contestantName)
                  return names.length > 0 ? names.join(' • ') : '—'
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reveal Rankings</h2>
        <div className="flex gap-4">
          <button
            onClick={revealNextRank}
            disabled={!revealRankings && revealedRanks.length > 0}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              !revealRankings && revealedRanks.length > 0 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {!revealRankings ? (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Reveal
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Reveal Next
              </>
            )}
          </button>

          <button
            onClick={revealAll}
            className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            Reveal All
          </button>

          {revealedRanks.length > 0 && (
            <button
              onClick={resetReveal}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Print Preview */}
      {showPrintPreview && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 print:shadow-none print:border-0">
          <div className="flex justify-end gap-2 mb-6 print:hidden">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
            >
              Print Now
            </button>
            <button
              onClick={() => setShowPrintPreview(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium"
            >
              Close
            </button>
          </div>

          {/* Printable Content */}
          <div ref={printableRef} className="print:p-0">
            {/* Rankings Table */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">FINAL RANKINGS</h2>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-2 px-2 font-bold">Rank</th>
                    <th className="text-left py-2 px-2 font-bold">Contestant</th>
                    {(tally?.judges || judges || [])?.map((judge) => (
                      <th key={judge.id} className="text-center py-2 px-1 font-bold text-xs">{judge.name}</th>
                    ))}
                    <th className="text-right py-2 px-2 font-bold">Final Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTallies.map((contestant) => {
                    const isShown = true // In print preview, always show all contestants
                    const rank = ranksMapRef.current[contestant.contestantId]
                    const isTied = tiedMapRef.current[contestant.contestantId]
                    
                    return (
                      <motion.tr 
                        key={contestant.contestantId} 
                        className={`border-b border-gray-400 ${!isShown ? 'opacity-0 h-0 overflow-hidden' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isShown ? 1 : 0, y: isShown ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: rank * 0.2 }}
                      >
                        <td className="py-2 px-2 font-semibold">{ranksMapRef.current[contestant.contestantId]}{tiedMapRef.current[contestant.contestantId] ? ' (tie)' : ''}</td>
                        <td className="py-2 px-2">{contestant.contestantName}</td>
                        {(tally?.judges || judges || [])?.map((judge) => {
                          // Weighted total per judge across criteria (align with audit): sum(score * weight%)
                          let weightedTotal = 0;
                          if (contestant.criteriaBreakdown && Array.isArray(contestant.criteriaBreakdown)) {
                            contestant.criteriaBreakdown.forEach((criteria: any) => {
                              const pct = Number(criteria.percentage) || 0;
                              const judgeScore = criteria.judgeScores && typeof criteria.judgeScores === 'object' ? criteria.judgeScores[judge.id] : undefined;
                              const val = judgeScore !== undefined && judgeScore !== null ? Number(judgeScore) : 0; // treat missing as 0
                              weightedTotal += (val * pct) / 100;
                            });
                          }

                          return (
                            <td key={`${contestant.contestantId}-${judge.id}`} className="text-center py-2 px-1">
                              {weightedTotal.toFixed(2)}
                            </td>
                          );
                        })}
                        <td className="py-2 px-2 text-right font-semibold">{contestant.totalScore.toFixed(2)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Detailed Audit: Per-Judge Scores by Criteria */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">DETAILED AUDIT: PER-JUDGE SCORES BY CRITERIA</h2>
              <p className="text-xs text-gray-600 mb-4">Shows each judge's raw score per criterion, alongside the average and weighted average per criterion for auditing.</p>
              {sortedTallies.map((contestant) => {
                // Build quick lookup of percentages per criteria id
                const criteriaPct: Record<number, number> = {}
                contestant.criteriaBreakdown.forEach(c => { criteriaPct[c.criteriaId] = c.percentage })

                const judgeWeightedTotals: Record<number, number> = {}
                ;(tally?.judges || judges || []).forEach(j => { judgeWeightedTotals[j.id] = 0 })

                return (
                  <div key={`audit-${contestant.contestantId}`} className="mb-8">
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{contestant.contestantName}</h3>
                      <div className="text-sm text-gray-700">Final Score: <span className="font-bold text-indigo-700">{contestant.totalScore.toFixed(2)}</span></div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-400">
                            <th className="text-left py-2 px-2 font-semibold">Criteria</th>
                            <th className="text-right py-2 px-2 font-semibold">Weight %</th>
                            {(tally?.judges || judges || []).map((j) => (
                              <th key={`head-${contestant.contestantId}-${j.id}`} className="text-center py-2 px-2 font-semibold">{j.name}</th>
                            ))}
                            <th className="text-right py-2 px-2 font-semibold">Average</th>
                            <th className="text-right py-2 px-2 font-semibold">Weighted Avg</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contestant.criteriaBreakdown.map((criteria) => {
                            return (
                              <tr key={`row-${contestant.contestantId}-${criteria.criteriaId}`} className="border-b border-gray-200">
                                <td className="py-2 px-2">{criteria.criteriaName}</td>
                                <td className="py-2 px-2 text-right">{criteria.percentage}%</td>
                                {(tally?.judges || judges || []).map((j) => {
                                  const raw = criteria.judgeScores && typeof criteria.judgeScores === 'object' ? criteria.judgeScores[j.id] : undefined
                                  const val = raw !== undefined && raw !== null ? Number(raw) : null
                                  const pct = criteriaPct[criteria.criteriaId] || 0
                                  const weighted = val !== null ? (val * pct) / 100 : null
                                  if (val !== null) {
                                    judgeWeightedTotals[j.id] += (val * pct) / 100
                                  }
                                  return (
                                    <td key={`cell-${contestant.contestantId}-${criteria.criteriaId}-${j.id}`} className="py-2 px-2 text-center">
                                      {val === null ? (
                                        '-'
                                      ) : (
                                        <div className="leading-tight">
                                          <span className="font-medium">{val.toFixed(1)}</span>
                                          <span className="block text-[10px] text-gray-600">wt {weighted?.toFixed(2)}</span>
                                        </div>
                                      )}
                                    </td>
                                  )
                                })}
                                <td className="py-2 px-2 text-right">{criteria.averageScore.toFixed(2)}</td>
                                <td className="py-2 px-2 text-right">{((criteria.averageScore * criteria.percentage) / 100).toFixed(2)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-400">
                            <td className="py-2 px-2 font-semibold">Judge Weighted Totals</td>
                            <td className="py-2 px-2"></td>
                            {(tally?.judges || judges || []).map((j) => (
                              <td key={`tot-${contestant.contestantId}-${j.id}`} className="py-2 px-2 text-center font-semibold">{(judgeWeightedTotals[j.id] || 0).toFixed(2)}</td>
                            ))}
                            <td className="py-2 px-2 text-right font-semibold">Avg Total</td>
                            <td className="py-2 px-2 text-right font-bold text-indigo-700">{contestant.totalScore.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Judges Signature Section */}
            <div className="mt-12 pt-8 border-t-2 border-black">
              <h3 className="text-xl font-bold text-gray-900 mb-8">JUDGES' CERTIFICATION</h3>
              <p className="text-sm text-gray-700 mb-8">
                We hereby certify that the above rankings are accurate and reflect the scores awarded by all judges participating in this event.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {(tally?.judges || judges)?.length > 0 ? (
                  (tally?.judges || judges)?.map((judge) => (
                    <div key={judge.id}>
                      <p className="text-sm font-medium text-gray-900 mb-12">{judge.name}</p>
                      <div className="border-b-2 border-black mb-2"></div>
                      <p className="text-xs text-gray-600">Judge Signature</p>
                      <p className="text-xs text-gray-600 mt-3">Date: _______________</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">No judges assigned to this event</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t-2 border-gray-400 text-center">
              <p className="text-xs text-gray-600">Event Rankings Report</p>
              <p className="text-xs text-gray-600">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rankings Summary</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to={`/events/${id}/rankings/criteria`}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-300 rounded-lg font-medium text-sm inline-flex items-center gap-2 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View by Criterion
          </Link>
        </div>
      </div>

      {/* Main Rankings */}
      {tally.tallies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">No scores yet. Judges need to submit scores.</p>
        </div>
      ) : (
        <>
          {/* Podium/Top 3 (only revealed ranks) */}
          {tally.tallies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3]
                .filter((rank) => revealRankings && revealedRanks.includes(rank))
                .map((rank) => {
                  const contestantsForRank = sortedTallies.filter((c) => ranksMapRef.current[c.contestantId] === rank)
                  const isTie = contestantsForRank.length > 1
                  const contestant = contestantsForRank[0]
                  const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
                  const bgColor = rank === 1 ? 'bg-yellow-50' : rank === 2 ? 'bg-gray-50' : 'bg-orange-50'
                  const borderColor = rank === 1 ? 'border-yellow-200' : rank === 2 ? 'border-gray-300' : 'border-orange-200'

                  return (
                    <div key={rank} className={`${bgColor} border-2 ${borderColor} rounded-lg p-6 text-center`}>
                      <div className="text-4xl mb-2">{medalEmoji}</div>
                      <p className="text-2xl font-bold text-gray-900">{rank}{isTie ? ' (tie)' : ''}</p>
                      {isTie ? (
                        <p className="text-lg font-semibold text-gray-900 mt-2">TIE</p>
                      ) : contestant ? (
                        <p className="text-lg font-semibold text-gray-900 mt-2">{contestant.contestantName}</p>
                      ) : (
                        <p className="text-lg font-semibold text-gray-900 mt-2">-</p>
                      )}
                      <p className="text-3xl font-bold text-indigo-600 mt-3">{contestant ? contestant.totalScore.toFixed(2) : ''}</p>
                      <p className="text-xs text-gray-600 mt-1">Total Score</p>
                    </div>
                  )
                })}
            </div>
          )}

          {/* Complete Rankings (shown after reveal completes) */}
          {revealRankings && revealedRanks.length === allRanks.length && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-xl font-bold text-white">Complete Rankings</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Contestant</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Total Score</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedTallies.map((contestant) => (
                    <React.Fragment key={contestant.contestantId}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{ranksMapRef.current[contestant.contestantId]}{tiedMapRef.current[contestant.contestantId] ? ' (tie)' : ''}</span>
                            {ranksMapRef.current[contestant.contestantId] === 1 && <span className="text-xl">🥇</span>}
                            {ranksMapRef.current[contestant.contestantId] === 2 && <span className="text-xl">🥈</span>}
                            {ranksMapRef.current[contestant.contestantId] === 3 && <span className="text-xl">🥉</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{contestant.contestantName}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-2xl font-bold text-indigo-600">{contestant.totalScore.toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setExpandedContestantId(expandedContestantId === contestant.contestantId ? null : contestant.contestantId)}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                          >
                            {expandedContestantId === contestant.contestantId ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>

                      {/* Criteria Breakdown */}
                      {expandedContestantId === contestant.contestantId && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900 text-sm">Breakdown by Criteria:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {contestant.criteriaBreakdown.map((criteria) => (
                                  <div key={criteria.criteriaId} className="bg-white border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <p className="font-medium text-gray-900 text-sm">{criteria.criteriaName}</p>
                                        <p className="text-xs text-gray-600">Weight: {criteria.percentage}%</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-indigo-600 text-lg">{criteria.weightedScore.toFixed(2)}</p>
                                        <p className="text-xs text-gray-600">Weighted</p>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs text-gray-600">Average Score:</span>
                                          <span className="text-xs font-semibold text-gray-900">{criteria.averageScore.toFixed(2)} / 100</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${criteria.averageScore}%` }}
                                          ></div>
                                        </div>
                                      </div>

                                      <p className="text-xs text-gray-600 pt-1">
                                        {criteria.scoresCount} judge{criteria.scoresCount !== 1 ? 's' : ''} scored
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Criteria Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Criteria Weights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tally.criteria.map((criterion) => (
                <div key={criterion.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-medium text-gray-900 mb-2">{criterion.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${criterion.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-12">{criterion.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
