import React, { useEffect, useState } from 'react'
import { criteriaApi } from '../api/client'

export interface EditCriteriaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  criteriaId: number
  initialName: string
  initialPercentage: number
  eventId?: number
}

export default function EditCriteriaModal({
  isOpen,
  onClose,
  onSuccess,
  criteriaId,
  initialName,
  initialPercentage,
  eventId,
}: EditCriteriaModalProps) {
  const [name, setName] = useState(initialName)
  const [percentage, setPercentage] = useState(initialPercentage.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setPercentage(initialPercentage.toString())
      setError(null)
    }
  }, [isOpen, initialName, initialPercentage])

  // fetch existing total excluding the current criteria
  const [existingTotal, setExistingTotal] = useState<number>(0)
  useEffect(() => {
    if (!isOpen || !eventId) return
    ;(async () => {
      try {
        const res = await criteriaApi.getByEvent(eventId)
        const items = res.data || []
        const total = items.reduce((acc: number, it: any) => {
          if (it.id === criteriaId) return acc
          return acc + (Number(it.percentage) || 0)
        }, 0)
        setExistingTotal(total)
      } catch (err) {
        // ignore
      }
    })()
  }, [isOpen, eventId, criteriaId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Criteria name is required')
      return
    }
    const percentageNum = parseFloat(percentage)
    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      setError('Percentage must be between 0 and 100')
      return
    }
    // validate aggregate total doesn't exceed 100
    if (existingTotal + percentageNum > 100) {
      setError(`Total weight would exceed 100% (current other total: ${existingTotal}%)`)
      return
    }
    setIsLoading(true)
    try {
      await criteriaApi.update(criteriaId, { name: name.trim(), percentage: percentageNum })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update criteria')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Edit Criteria</h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-600">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage <span className="text-red-600">*</span></label>
            <input
              type="number"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {/* Totals / Warning */}
          <div className="space-y-2">
            <div className="text-sm">
              <p className={existingTotal >= 100 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                Other criteria total: <span className="font-semibold">{existingTotal}%</span>
              </p>
              <p className={existingTotal + Number(percentage) > 100 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                After edit: <span className="font-semibold">{existingTotal + Number(percentage)}%</span>
              </p>
            </div>

            {existingTotal + Number(percentage) > 100 && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                Total percentage cannot exceed 100%. Adjust this value or edit other criteria first.
              </div>
            )}
          </div>
        </form>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 justify-end">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            {isLoading ? 'Updating...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

