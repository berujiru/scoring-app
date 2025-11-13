import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { judgesApi, judgingApi } from '../api/client'

function ErrorModal({ message, onClose }: { message: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
        <div className="mb-4 text-gray-700">{message}</div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function JudgeScoring() {
  const { code } = useParams<{ code: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [judge, setJudge] = useState<any | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<Record<string, 'success' | 'error' | null>>({})
  const [activeContestantId, setActiveContestantId] = useState<number | null>(null)

  useEffect(() => {
    const fetchJudge = async () => {
      if (!code) return
      setLoading(true)
      setError(null)
      try {
        const res = await judgesApi.getByCode(code)
        setJudge(res.data)
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Judge link not found')
        } else {
          setError('Failed to load judge link')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchJudge()
  }, [code])

  useEffect(() => {
    if (judge && judge.event && judge.event.contestants && judge.event.criteria) {
      // initialize score keys
      const initial: Record<string, number> = {}
      judge.event.contestants.forEach((c: any) => {
        judge.event.criteria.forEach((cr: any) => {
          initial[`${c.id}-${cr.id}`] = 0
        })
      })
      
      // Fetch existing scores from the server
      const fetchExistingScores = async () => {
        try {
          const res = await judgingApi.getScoresByCode(judge.code, judge.event.id)
          const existingScores = res.data
          
          // Populate initial scores with existing scores
          existingScores.forEach((score: any) => {
            const key = `${score.contestantId}-${score.criteriaId}`
            initial[key] = score.score
          })
        } catch (err) {
          console.error('Failed to fetch existing scores', err)
        }
        
        setScores(initial)
      }
      
      fetchExistingScores()
    }
  }, [judge])

  // Initialize the active contestant (first one) once data is available
  useEffect(() => {
    if (judge?.event?.contestants?.length && activeContestantId == null) {
      setActiveContestantId(judge.event.contestants[0].id)
    }
  }, [judge, activeContestantId])

  const handleChange = (contestantId: number, criteriaId: number, value: string) => {
    const key = `${contestantId}-${criteriaId}`
    const num = Number(value)
    if (isNaN(num)) return
    setScores((s) => ({ ...s, [key]: Math.max(0, Math.min(100, num)) }))
  }

  const handleSubmit = async (contestantId: number, criteriaId: number) => {
    if (!judge) return
    const key = `${contestantId}-${criteriaId}`
    const score = scores[key]
    setSaving((s) => ({ ...s, [key]: true }))
    setSaveStatus((s) => ({ ...s, [key]: null }))
    try {
      await judgingApi.submitByCode({
        score,
        eventId: judge.event.id,
        contestantId,
        criteriaId,
        judgeCode: judge.code,
      })
      // Show success status
      setSaveStatus((s) => ({ ...s, [key]: 'success' }))
      // Auto-clear success after 2 seconds
      setTimeout(() => {
        setSaveStatus((s) => ({ ...s, [key]: null }))
      }, 2000)
    } catch (err) {
      console.error('Failed to submit score', err)
      setModalError('Failed to submit score. Please try again.')
      // Show error status
      setSaveStatus((s) => ({ ...s, [key]: 'error' }))
      // Auto-clear error after 3 seconds
      setTimeout(() => {
        setSaveStatus((s) => ({ ...s, [key]: null }))
      }, 3000)
    } finally {
      setSaving((s) => ({ ...s, [key]: false }))
    }
  }

  // Compute total weighted score for a contestant
  const totalWeightedFor = (contestantId: number): number => {
    if (!judge?.event?.criteria) return 0
    let sum = 0
    judge.event.criteria.forEach((cr: any) => {
      const key = `${contestantId}-${cr.id}`
      const score = scores[key]
      if (typeof score === 'number' && !isNaN(score)) {
        sum += (score * cr.percentage) / 100
      }
    })
    return Number(sum.toFixed(2))
  }

  if (loading) return <div className="py-12 text-center">Loading judge link...</div>

  if (error || !judge) return <div className="py-12 text-center text-red-600">{error || 'Not found'}</div>

  const event = judge.event

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {modalError && <ErrorModal message={modalError} onClose={() => setModalError(null)} />}
      
      <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-10">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-8 mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-4xl font-bold text-gray-900 mb-2">{event.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Judge:</span>
              <span className="text-base sm:text-lg font-semibold text-indigo-600">{judge.name}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="font-semibold">📋</span> Authenticated by judge code. Enter scores 0-100.
          </p>
        </div>

        {/* Contestants Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 sm:px-8 py-3 sm:py-6">
            <h2 className="text-lg sm:text-2xl font-bold text-white">Scoring</h2>
            <p className="text-indigo-100 mt-0 sm:mt-1 text-xs sm:text-sm">Rate each contestant</p>
          </div>

          <div className="p-3 sm:p-8">
            {event.contestants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No contestants available.</p>
              </div>
            )}

            {/* Contestant selector: mobile dropdown + desktop tabs */}
            {event.contestants.length > 0 && (
              <div className="mb-4 sm:mb-6">
                {/* Mobile: Select */}
                <label className="block sm:hidden text-xs font-medium text-gray-700 mb-1">Select contestant</label>
                <select
                  className="sm:hidden w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={activeContestantId ?? ''}
                  onChange={(e) => setActiveContestantId(Number(e.target.value))}
                >
                  {event.contestants.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — Total: {totalWeightedFor(c.id)}
                    </option>
                  ))}
                </select>

                {/* Desktop: Tabs */}
                <div className="hidden sm:flex gap-2 overflow-x-auto py-1" role="tablist" aria-label="Contestants">
                  {event.contestants.map((c: any) => {
                    const active = c.id === activeContestantId
                    return (
                      <button
                        key={c.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveContestantId(c.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full border-2 text-sm font-semibold transition-colors ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                        }`}
                        title={`Total: ${totalWeightedFor(c.id)}`}
                      >
                        {c.name}
                        <span className="ml-2 text-xs opacity-80">({totalWeightedFor(c.id)})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Only show the active contestant to avoid mis-scoring */}
            <div className="space-y-4 sm:space-y-8">
              {(activeContestantId ? event.contestants.filter((x: any) => x.id === activeContestantId) : event.contestants).map((c: any) => (
                <div key={c.id} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Contestant Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-2 sm:py-4 border-b-2 border-gray-200">
                    <p className="text-base sm:text-2xl font-bold text-gray-900">{c.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0 sm:mt-1">ID: {c.id}</p>
                  </div>

                  {/* Criteria Grid */}
                  <div className="p-3 sm:p-8 bg-white">
                    {/* Total Weighted Summary for the contestant */}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-semibold text-gray-800">Total Weighted Score</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-indigo-700">{totalWeightedFor(c.id)}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-600 mt-1">This is the sum of each criterion score multiplied by its weight. It helps you anticipate the overall total.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                      {event.criteria.map((cr: any) => {
                        const key = `${c.id}-${cr.id}`
                        const score = scores[key] ?? ''
                        const weighted = typeof score === 'number' && !isNaN(score)
                          ? ((score * cr.percentage) / 100).toFixed(2)
                          : ''
                        const status = saveStatus[key]
                        return (
                          <div key={cr.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-5 hover:shadow-md transition-shadow">
                            <div className="mb-3">
                              <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-1" htmlFor={`score-{c.id}-{cr.id}`}>
                                {cr.name}
                              </label>
                              <p className="text-xs sm:text-sm text-gray-600 font-medium">Weight: <span className="text-indigo-600">{cr.percentage}%</span></p>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-end gap-2">
                                <input
                                  id={`score-${c.id}-${cr.id}`}
                                  type="number"
                                  min={0}
                                  max={100}
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={score}
                                  onChange={(e) => handleChange(c.id, cr.id, e.target.value)}
                                  step={1}
                                  className="flex-1 px-4 py-3 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg sm:text-lg font-semibold touch-manipulation"
                                  aria-label={`Score for ${c.name} - ${cr.name}`}
                                />
                                <span className="text-base sm:text-lg font-semibold text-gray-600 pb-2 sm:pb-3">/ 100</span>
                              </div>

                              {weighted && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                                  <p className="text-xs sm:text-sm text-gray-600">Weighted</p>
                                  <p className="text-lg sm:text-2xl font-bold text-green-700">{weighted}</p>
                                </div>
                              )}

                              <button
                                onClick={() => handleSubmit(c.id, cr.id)}
                                disabled={saving[key]}
                                className={`w-full py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-white font-bold transition-all text-sm sm:text-base ${
                                  saving[key]
                                    ? 'bg-blue-500 opacity-75'
                                    : status === 'success'
                                    ? 'bg-green-600'
                                    : status === 'error'
                                    ? 'bg-red-600'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                              >
                                {saving[key] ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span className="hidden sm:inline">Saving...</span>
                                    <span className="sm:hidden">...</span>
                                  </span>
                                ) : status === 'success' ? (
                                  <span className="flex items-center justify-center gap-1 sm:gap-2">
                                    <span className="text-lg sm:text-xl">✓</span>
                                    <span className="hidden sm:inline">Saved</span>
                                  </span>
                                ) : status === 'error' ? (
                                  <span className="flex items-center justify-center gap-1 sm:gap-2">
                                    <span className="text-lg sm:text-xl">✗</span>
                                    <span className="hidden sm:inline">Failed</span>
                                  </span>
                                ) : (
                                  'Save'
                                )}
                              </button>

                              {status === 'success' && (
                                <p className="text-xs sm:text-sm text-green-700 font-medium text-center">✓ Saved</p>
                              )}
                              {status === 'error' && (
                                <p className="text-xs sm:text-sm text-red-700 font-medium text-center">✗ Failed</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
