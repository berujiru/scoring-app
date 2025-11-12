import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { judgesApi, judgingApi } from '../api/client'

export default function JudgeScoring() {
  const { code } = useParams<{ code: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [judge, setJudge] = useState<any | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

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
      setScores(initial)
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
    try {
      await judgingApi.submitByCode({
        score,
        eventId: judge.event.id,
        contestantId,
        criteriaId,
        judgeCode: judge.code,
      })
      // optionally show success; we just keep the value
    } catch (err) {
      console.error('Failed to submit score', err)
      alert('Failed to submit score')
    } finally {
      setSaving((s) => ({ ...s, [key]: false }))
    }
  }

  if (loading) return <div className="py-12 text-center">Loading judge link...</div>

  if (error || !judge) return <div className="py-12 text-center text-red-600">{error || 'Not found'}</div>

  const event = judge.event

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold">{event.name}</h2>
        <p className="text-sm text-gray-600">Judge: <span className="font-medium">{judge.name}</span></p>
        <p className="text-xs text-gray-500 mt-2">This scoring link is authenticated by your unique judge code and cannot be changed.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="font-semibold mb-3">Contestants</h3>
        {event.contestants.length === 0 && <p className="text-gray-500">No contestants available.</p>}
        <div className="space-y-4">
          {event.contestants.map((c: any) => (
            <div key={c.id} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500">ID: {c.id}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {event.criteria.map((cr: any) => {
                  const key = `${c.id}-${cr.id}`
                  return (
                    <div key={cr.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{cr.name} <span className="text-xs text-gray-500">({cr.percentage}%)</span></p>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={scores[key] ?? ''}
                          onChange={(e) => handleChange(c.id, cr.id, e.target.value)}
                          className="mt-1 w-28 px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <button
                          onClick={() => handleSubmit(c.id, cr.id)}
                          disabled={saving[key]}
                          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
                        >
                          {saving[key] ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
