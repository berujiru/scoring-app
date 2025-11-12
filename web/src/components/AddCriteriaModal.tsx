import React, { useState, useEffect } from 'react'
import { criteriaApi } from '../api/client'

export interface AddCriteriaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  eventId: number
}

export default function AddCriteriaModal({
  isOpen,
  onClose,
  onSuccess,
  eventId,
}: AddCriteriaModalProps) {
  const [name, setName] = useState('')
  const [percentage, setPercentage] = useState('20')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingTotal, setExistingTotal] = useState<number>(0)
  const [isOverLimit, setIsOverLimit] = useState<boolean>(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setPercentage('20')
      setError(null)
      setExistingTotal(0)
      setIsOverLimit(false)
      // fetch existing criteria totals for event
      ;(async () => {
        try {
          const res = await criteriaApi.getByEvent(eventId)
          const items = res.data || []
          const total = items.reduce((acc: number, it: any) => acc + (Number(it.percentage) || 0), 0)
          setExistingTotal(total)
        } catch (err) {
          // ignore, leave existingTotal as 0
        }
      })()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (!name.trim()) {
      setError('Criteria name is required')
      return
    }

    const percentageNum = parseFloat(percentage)
    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      setError('Percentage must be between 0 and 100')
      return
    }

    // Validate aggregate total does not exceed 100
    if (existingTotal + percentageNum > 100) {
      setError(`Total weight would exceed 100% (current total: ${existingTotal}%)`)
      return
    }

    setIsLoading(true)
    try {
      // Create criteria
      await criteriaApi.create({
        name: name.trim(),
        percentage: percentageNum,
        eventId,
      })

      // Success
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add criteria')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Add Scoring Criteria</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Criteria Name Field */}
          <div>
            <label htmlFor="criteria-name" className="block text-sm font-medium text-gray-700 mb-1">
              Criteria Name <span className="text-red-600">*</span>
            </label>
            <input
              id="criteria-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., Creativity"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Percentage Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="criteria-percentage" className="block text-sm font-medium text-gray-700">
                Weight Percentage <span className="text-red-600">*</span>
              </label>
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded">
                {percentage}%
              </span>
            </div>
            <input
              id="criteria-percentage"
              type="range"
              min="0"
              max="100"
              step="5"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Number Input as Alternative */}
          <div>
            <label htmlFor="criteria-number" className="block text-sm font-medium text-gray-700 mb-1">
              Or enter percentage directly
            </label>
            <div className="flex gap-2">
              <input
                id="criteria-number"
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                  setPercentage(val.toString())
                }}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                %
              </span>
            </div>
          </div>

            {/* Totals / Warning */}
            <div className="space-y-2">
              <div className="text-sm">
                <p className={existingTotal >= 100 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  Current criteria total: <span className="font-semibold">{existingTotal}%</span>
                </p>
                <p className={existingTotal + Number(percentage) > 100 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                  If added: <span className="font-semibold">{existingTotal + Number(percentage)}%</span>
                </p>
              </div>

              {existingTotal + Number(percentage) > 100 ? (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  Total percentage cannot exceed 100%. Adjust this value or edit existing criteria first.
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                  <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Set the weight percentage for this scoring criteria. All criteria should sum to 100%.</span>
                </div>
              )}
            </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Adding...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Criteria
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
