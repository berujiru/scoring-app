import React, { useEffect, useState } from 'react'
import { judgesApi } from '../api/client'

export interface EditJudgeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  judgeId: number
  initialName: string
}

export default function EditJudgeModal({
  isOpen,
  onClose,
  onSuccess,
  judgeId,
  initialName,
}: EditJudgeModalProps) {
  const [name, setName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setError(null)
    }
  }, [isOpen, initialName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Judge name is required')
      return
    }
    setIsLoading(true)
    try {
      await judgesApi.update(judgeId, { name: name.trim() })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update judge')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Edit Judge</h2>
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
        </form>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 justify-end">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            {isLoading ? 'Updating...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
