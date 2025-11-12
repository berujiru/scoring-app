import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { judgingApi, judgesApi } from '../api/client'

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

export default function EventRankings() {
  const { id } = useParams<{ id: string }>()
  const [tally, setTally] = useState<Tally | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedContestantId, setExpandedContestantId] = useState<number | null>(null)
  const [judges, setJudges] = useState<Array<{ id: number; name: string }>>([])
  const [showPrintPreview, setShowPrintPreview] = useState(false)

  useEffect(() => {
    const fetchTally = async () => {
      if (!id) return
      setIsLoading(true)
      setError(null)
      try {
        const response = await judgingApi.getTallyByEvent(parseInt(id))
        setTally(response.data)
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

      {/* Print Preview */}
      {showPrintPreview && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 print:shadow-none print:border-0">
          <div className="flex justify-end gap-2 mb-6 print:hidden">
            <button
              onClick={() => window.print()}
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
          <div className="print:p-0">
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
                  {tally?.tallies?.map((contestant, index) => {
                    return (
                      <tr key={contestant.contestantId} className="border-b border-gray-400">
                        <td className="py-2 px-2 font-semibold">{index + 1}</td>
                        <td className="py-2 px-2">{contestant.contestantName}</td>
                        {(tally?.judges || judges || [])?.map((judge) => {
                          // Collect all scores from this judge across all criteria
                          const allScoresForJudge: number[] = [];
                          
                          if (contestant.criteriaBreakdown && Array.isArray(contestant.criteriaBreakdown)) {
                            contestant.criteriaBreakdown.forEach((criteria: any) => {
                              // Check if judgeScores exists and has data for this judge
                              if (criteria.judgeScores && typeof criteria.judgeScores === 'object') {
                                const judgeScore = criteria.judgeScores[judge.id];
                                if (judgeScore !== undefined && judgeScore !== null) {
                                  allScoresForJudge.push(Number(judgeScore));
                                } else {
                                  allScoresForJudge.push(0); // Missing score counts as 0
                                }
                              } else {
                                allScoresForJudge.push(0); // No judgeScores data
                              }
                            });
                          }
                          
                          // Calculate average
                          const avgScore = allScoresForJudge.length > 0
                            ? allScoresForJudge.reduce((sum, score) => sum + score, 0) / allScoresForJudge.length
                            : 0;
                          
                          return (
                            <td key={`${contestant.contestantId}-${judge.id}`} className="text-center py-2 px-1">
                              {avgScore.toFixed(1)}
                            </td>
                          );
                        })}
                        <td className="py-2 px-2 text-right font-semibold">{contestant.totalScore.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
