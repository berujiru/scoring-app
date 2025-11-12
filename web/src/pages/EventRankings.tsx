import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { judgingApi } from '../api/client'

interface Tally {
  eventId: number
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
    }>
  }>
  criteria: Array<{
    id: number
    name: string
    percentage: number
  }>
}

export default function EventRankings() {
  const { id } = useParams<{ id: string }>()
  const [tally, setTally] = useState<Tally | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedContestantId, setExpandedContestantId] = useState<number | null>(null)

  useEffect(() => {
    const fetchTally = async () => {
      if (!id) return
      setIsLoading(true)
      setError(null)
      try {
        const response = await judgingApi.getTallyByEvent(parseInt(id))
        setTally(response.data)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch rankings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTally()
  }, [id])

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

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Rankings</h1>
        <p className="text-gray-600">Final scores and detailed breakdown by criteria</p>
      </div>

      {/* Main Rankings */}
      {tally.tallies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">No scores yet. Judges need to submit scores.</p>
        </div>
      ) : (
        <>
          {/* Podium/Top 3 */}
          {tally.tallies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {tally.tallies.slice(0, 3).map((contestant, index) => {
                const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                const bgColor = index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : 'bg-orange-50'
                const borderColor = index === 0 ? 'border-yellow-200' : index === 1 ? 'border-gray-300' : 'border-orange-200'

                return (
                  <div key={contestant.contestantId} className={`${bgColor} border-2 ${borderColor} rounded-lg p-6 text-center`}>
                    <div className="text-4xl mb-2">{medalEmoji}</div>
                    <p className="text-2xl font-bold text-gray-900">{index + 1}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{contestant.contestantName}</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-3">{contestant.totalScore.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Score</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full Rankings Table */}
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
                  {tally.tallies.map((contestant, index) => (
                    <React.Fragment key={contestant.contestantId}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{index + 1}</span>
                            {index === 0 && <span className="text-xl">🥇</span>}
                            {index === 1 && <span className="text-xl">🥈</span>}
                            {index === 2 && <span className="text-xl">🥉</span>}
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
