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

export default function CriteriaRankings() {
  const { id } = useParams<{ id: string }>()
  const [tally, setTally] = useState<Tally | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<number | null>(null)

  useEffect(() => {
    const fetchTally = async () => {
      if (!id) return
      setIsLoading(true)
      setError(null)
      try {
        const response = await judgingApi.getTallyByEvent(parseInt(id))
        setTally(response.data)
        // Set first criteria as default
        if (response.data.criteria.length > 0) {
          setSelectedCriteriaId(response.data.criteria[0].id)
        }
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
          <p className="text-gray-600">Loading criteria rankings...</p>
        </div>
      </div>
    )
  }

  if (error || !tally) {
    return (
      <div className="space-y-4">
        <Link
          to={`/events/${id}/rankings`}
          className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm inline-flex"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Rankings
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error loading criteria rankings</p>
          <p className="text-sm mt-1">{error || 'Unable to load rankings'}</p>
        </div>
      </div>
    )
  }

  const selectedCriteria = tally.criteria.find(c => c.id === selectedCriteriaId)
  
  // Get rankings for selected criteria
  const criteriaRankings = tally.tallies
    .map(contestant => {
      const breakdown = contestant.criteriaBreakdown.find(cb => cb.criteriaId === selectedCriteriaId)
      return {
        contestantId: contestant.contestantId,
        contestantName: contestant.contestantName,
        averageScore: breakdown?.averageScore || 0,
        weightedScore: breakdown?.weightedScore || 0,
        scoresCount: breakdown?.scoresCount || 0,
      }
    })
    .sort((a, b) => b.averageScore - a.averageScore)

  // Compute ranks and tie information using competition ranking ("1224" style)
  const EPS = 1e-6
  const ranksMap: Record<number, number> = {}
  const tiedMap: Record<number, boolean> = {}

  if (criteriaRankings.length > 0) {
    let prevScore = NaN
    let prevRank = 0
    let prevId: number | null = null
    
    for (let i = 0; i < criteriaRankings.length; i++) {
      const c = criteriaRankings[i]
      const s = c.averageScore
      
      if (i === 0) {
        ranksMap[c.contestantId] = 1
        prevScore = s
        prevRank = 1
        prevId = c.contestantId
      } else {
        if (Math.abs(s - prevScore) <= EPS) {
          // tie with previous
          ranksMap[c.contestantId] = prevRank
          tiedMap[c.contestantId] = true
          if (prevId !== null) tiedMap[prevId] = true
        } else {
          const rank = i + 1
          ranksMap[c.contestantId] = rank
          prevRank = rank
        }
        prevScore = s
        prevId = c.contestantId
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to={`/events/${id}/rankings`}
        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm inline-flex"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Rankings
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rankings by Criterion</h1>
        <p className="text-gray-600">View top contestants for each scoring criterion</p>
      </div>

      {/* Criteria Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Criterion</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tally.criteria.map((criterion) => (
            <button
              key={criterion.id}
              onClick={() => setSelectedCriteriaId(criterion.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedCriteriaId === criterion.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <p className="font-semibold text-sm text-gray-900 mb-1">{criterion.name}</p>
              <p className="text-xs text-gray-600">Max Points: {criterion.percentage}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Criteria Rankings */}
      {selectedCriteria && (
        <>
          {/* Header for selected criteria */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-sm p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{selectedCriteria.name}</h2>
            <p className="text-indigo-100">Max Points: {selectedCriteria.percentage}</p>
          </div>

          {/* Podium */}
          {criteriaRankings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {criteriaRankings.slice(0, 3).map((contestant, index) => {
                const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                const bgColor = index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : 'bg-orange-50'
                const borderColor = index === 0 ? 'border-yellow-200' : index === 1 ? 'border-gray-300' : 'border-orange-200'

                return (
                  <div key={contestant.contestantId} className={`${bgColor} border-2 ${borderColor} rounded-lg p-6 text-center`}>
                    <div className="text-4xl mb-2">{medalEmoji}</div>
                    <p className="text-2xl font-bold text-gray-900">{index + 1}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{contestant.contestantName}</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-3">{selectedCriteria.percentage ? ((contestant.averageScore / selectedCriteria.percentage) * 100).toFixed(1) : '0'}%</p>
                    <p className="text-xs text-gray-600 mt-1">Percentage</p>
                    <p className="text-xs text-gray-600 mt-2">Avg: {contestant.averageScore.toFixed(2)} / {selectedCriteria.percentage}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Contestant</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Average Points</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Max Points</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Judge Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {criteriaRankings.map((contestant, index) => (
                    <tr key={contestant.contestantId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {ranksMap[contestant.contestantId]}{tiedMap[contestant.contestantId] ? ' (tie)' : ''}
                          </span>
                          {index === 0 && <span className="text-xl">🥇</span>}
                          {index === 1 && <span className="text-xl">🥈</span>}
                          {index === 2 && <span className="text-xl">🥉</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{contestant.contestantName}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <p className="text-2xl font-bold text-indigo-600">{contestant.averageScore.toFixed(2)}</p>
                          <p className="text-xs text-gray-600">/ {selectedCriteria.percentage}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-lg font-semibold text-green-700">{selectedCriteria.percentage}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {contestant.scoresCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Score Distribution Chart Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
            <div className="space-y-3">
              {criteriaRankings.map((contestant, index) => (
                <div key={contestant.contestantId} className="flex items-center gap-3">
                  <div className="w-24">
                    <p className="text-sm font-medium text-gray-900 truncate">{contestant.contestantName}</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${selectedCriteria ? (contestant.averageScore / selectedCriteria.percentage) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <p className="text-sm font-semibold text-gray-900">{contestant.averageScore.toFixed(1)}</p>
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
