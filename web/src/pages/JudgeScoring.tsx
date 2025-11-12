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
            
            <div className="space-y-4 sm:space-y-8">
              {event.contestants.map((c: any) => (
                <div key={c.id} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Contestant Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-2 sm:py-4 border-b-2 border-gray-200">
                    <p className="text-base sm:text-2xl font-bold text-gray-900">{c.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0 sm:mt-1">ID: {c.id}</p>
                  </div>

                  {/* Criteria Grid */}
                  <div className="p-3 sm:p-8 bg-white">
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
                              <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-1" htmlFor={`score-${c.id}-${cr.id}`}>
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
                                  className="flex-1 px-3 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-lg font-semibold"
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
