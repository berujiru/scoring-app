import React, { useState, useEffect } from 'react'
import { judgesApi } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export interface AddJudgeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  eventId: number
}

export default function AddJudgeModal({
  isOpen,
  onClose,
  onSuccess,
  eventId,
}: AddJudgeModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setError(null)
      setGeneratedCode(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (!name.trim()) {
      setError('Judge name is required')
      return
    }

    if (!user) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)
    try {
      // Create judge
      const response = await judgesApi.create({
        name: name.trim(),
        eventId,
        userId: user.id,
      })

      // Store the generated code for display
      setGeneratedCode(response.data.code)

      // Success
      onSuccess()

      // Auto-close after 2 seconds so user can see the code
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add judge')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Add Judge</h2>
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

          {/* Success Alert with Generated Code */}
          {generatedCode && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg space-y-2">
              <p className="font-medium flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Judge added successfully!
              </p>
              <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm text-center">
                <p className="text-gray-600 text-xs mb-1">Share this code:</p>
                <p className="font-bold text-lg text-green-700 tracking-widest">{generatedCode}</p>
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="w-full px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </button>
            </div>
          )}

          {/* Judge Name Field */}
          {!generatedCode && (
            <div>
              <label htmlFor="judge-name" className="block text-sm font-medium text-gray-700 mb-1">
                Judge Name <span className="text-red-600">*</span>
              </label>
              <input
                id="judge-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Dr. Jane Smith"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {/* Help Text */}
          {!generatedCode && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Judge will be assigned a unique code to access the scoring interface.</span>
            </div>
          )}

          {generatedCode && (
            <div className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Share the code above with the judge to let them access the event.</span>
            </div>
          )}
        </form>

        {/* Footer */}
        {!generatedCode && (
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed font-medium flex items-center gap-2"
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
                  Add Judge
                </>
              )}
            </button>
          </div>
        )}
        {generatedCode && (
          <div className="flex gap-3 px-6 py-4 border-t border-gray-200 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
