import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsApi, contestantsApi, judgesApi, criteriaApi } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { EventCardData } from '../components/EventCard'
import EditEventModal from '../components/EditEventModal'
import QRCode from 'react-qr-code'
import AddContestantModal from '../components/AddContestantModal'
import AddJudgeModal from '../components/AddJudgeModal'
import AddCriteriaModal from '../components/AddCriteriaModal'
import EditContestantModal from '../components/EditContestantModal'
import EditJudgeModal from '../components/EditJudgeModal'
import EditCriteriaModal from '../components/EditCriteriaModal'

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<EventCardData & {
    contestants?: Array<{ id: number; name: string }>
    judges?: Array<{ id: number; name: string; code: string }>
    criteria?: Array<{ id: number; name: string; percentage: number }>
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddContestantModalOpen, setIsAddContestantModalOpen] = useState(false)
  const [isAddJudgeModalOpen, setIsAddJudgeModalOpen] = useState(false)
  const [isAddCriteriaModalOpen, setIsAddCriteriaModalOpen] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null)
  const [deletingItemType, setDeletingItemType] = useState<'contestant' | 'judge' | 'criteria' | null>(null)
  // Per-item edit modal states
  const [isEditContestantOpen, setIsEditContestantOpen] = useState(false)
  const [editingContestantId, setEditingContestantId] = useState<number | null>(null)
  const [editingContestantName, setEditingContestantName] = useState<string>('')

  const [isEditJudgeOpen, setIsEditJudgeOpen] = useState(false)
  const [editingJudgeId, setEditingJudgeId] = useState<number | null>(null)
  const [editingJudgeName, setEditingJudgeName] = useState<string>('')

  const [isEditCriteriaOpen, setIsEditCriteriaOpen] = useState(false)
  const [editingCriteriaId, setEditingCriteriaId] = useState<number | null>(null)
  const [editingCriteriaName, setEditingCriteriaName] = useState<string>('')
  const [editingCriteriaPercentage, setEditingCriteriaPercentage] = useState<number>(0)
  const [qrModalJudgeId, setQrModalJudgeId] = useState<number | null>(null)

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!id) return
      setIsLoading(true)
      setError(null)
      try {
        const response = await eventsApi.getById(parseInt(id))
        setEvent(response.data)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch event details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventDetail()
  }, [id])

  const handleRefresh = async () => {
    if (!id) return
    try {
      const response = await eventsApi.getById(parseInt(id))
      setEvent(response.data)
    } catch (err: any) {
      console.error('Failed to refresh event', err)
    }
  }

  const handleDeleteItem = async () => {
    if (!deletingItemId || !deletingItemType) return
    
    try {
      if (deletingItemType === 'contestant') {
        await contestantsApi.delete(deletingItemId)
      } else if (deletingItemType === 'judge') {
        await judgesApi.delete(deletingItemId)
      } else if (deletingItemType === 'criteria') {
        await criteriaApi.delete(deletingItemId)
      }
      
      setDeletingItemId(null)
      setDeletingItemType(null)
      await handleRefresh()
    } catch (err: any) {
      console.error('Failed to delete item', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link
          to="/events"
          className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error loading event</p>
          <p className="text-sm mt-1">{error || 'Event not found'}</p>
        </div>
      </div>
    )
  }

  const createdDate = new Date(event.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/events"
        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm inline-flex"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
            {event.active && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active Event
              </span>
            )}
          </div>
          {user && event.user && user.id === event.user.id && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 font-medium"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Event
            </button>
          )}
        </div>

        {event.description && (
          <p className="text-gray-700 mb-4">{event.description}</p>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Created by</p>
              <p className="font-medium text-gray-900">{event.user?.name}</p>
              <p className="text-gray-600">{event.user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Created on</p>
              <p className="font-medium text-gray-900">{createdDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Contestants</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {event.contestants?.length || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM12 14a8 8 0 00-8 8v2h16v-2a8 8 0 00-8-8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Judges</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {event.judges?.length || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Criteria</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {event.criteria?.length || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contestants Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Contestants</h3>
            {user && event.user && user.id === event.user.id && (
              <button
                onClick={() => setIsAddContestantModalOpen(true)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1 font-medium"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {event.contestants && event.contestants.length > 0 ? (
              event.contestants.map((contestant) => (
                <div key={contestant.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 group">
                  <p className="text-gray-900 font-medium">{contestant.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      ID: {contestant.id}
                    </span>
                    {user && event.user && user.id === event.user.id && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingContestantId(contestant.id)
                                  setEditingContestantName(contestant.name)
                                  setIsEditContestantOpen(true)
                                }}
                                className="text-indigo-600 hover:text-indigo-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                title="Edit contestant"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => {
                                  setDeletingItemId(contestant.id)
                                  setDeletingItemType('contestant')
                                }}
                                className="text-red-600 hover:text-red-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                title="Delete contestant"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No contestants yet
                {user && event.user && user.id === event.user.id && (
                  <button
                    onClick={() => setIsAddContestantModalOpen(true)}
                    className="block mx-auto mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
                  >
                    Add First Contestant
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Judges Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Judges</h3>
            {user && event.user && user.id === event.user.id && (
              <button
                onClick={() => setIsAddJudgeModalOpen(true)}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center gap-1 font-medium"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {event.judges && event.judges.length > 0 ? (
              event.judges.map((judge) => (
                <div key={judge.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 group">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{judge.name}</p>
                    {judge.code && (
                      <p className="text-xs text-gray-500 font-mono">
                        Code: <span className="text-purple-600 font-semibold">{judge.code}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      ID: {judge.id}
                    </span>
                    {user && event.user && user.id === event.user.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingJudgeId(judge.id)
                            setEditingJudgeName(judge.name)
                            setIsEditJudgeOpen(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          title="Edit judge"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => {
                            setDeletingItemId(judge.id)
                            setDeletingItemType('judge')
                          }}
                          className="text-red-600 hover:text-red-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          title="Delete judge"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        {/* QR code (public) - only visible to event owner; opens a modal for easy scanning */}
                        <button
                          onClick={() => setQrModalJudgeId(judge.id)}
                          className="text-gray-500 hover:text-gray-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          title="Show QR code"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h6v6H3V3zm0 12h6v6H3v-6zM15 3h6v6h-6V3zm0 12h6v6h-6v-6z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No judges yet
                {user && event.user && user.id === event.user.id && (
                  <button
                    onClick={() => setIsAddJudgeModalOpen(true)}
                    className="block mx-auto mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 font-medium"
                  >
                    Add First Judge
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Criteria Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Scoring Criteria</h3>
            <p className="text-sm text-gray-600">Total: <span className="font-medium">{(event.criteria || []).reduce((s, c) => s + (c.percentage || 0), 0)}%</span></p>
          </div>
          <div className="flex items-center gap-2">
            {user && event.user && user.id === event.user.id && (
              <>
                <button
                  onClick={() => setIsAddCriteriaModalOpen(true)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1 font-medium"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
                <button
                  onClick={async () => {
                    const total = (event.criteria || []).reduce((s, c) => s + (c.percentage || 0), 0)
                    if (total !== 100) {
                      // show a simple alert modal (use existing delete confirmation modal pattern)
                      alert(`Criteria total must be exactly 100% to finalize. Current total: ${total}%`)
                      return
                    }
                    try {
                      await eventsApi.update(event.id, { active: true })
                      await handleRefresh()
                    } catch (err) {
                      console.error('Failed to activate event', err)
                    }
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center gap-1 font-medium"
                >
                  Calibrate
                </button>
              </>
            )}
          </div>
        </div>
        {event.criteria && event.criteria.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {event.criteria.map((criterion) => (
              <div key={criterion.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 group">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{criterion.name}</p>
                  <p className="text-sm text-gray-600">Weight: {criterion.percentage}%</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${criterion.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {criterion.percentage}%
                    </span>
                  </div>
                  {user && event.user && user.id === event.user.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCriteriaId(criterion.id)
                          setEditingCriteriaName(criterion.name)
                          setEditingCriteriaPercentage(criterion.percentage)
                          setIsEditCriteriaOpen(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        title="Edit criteria"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          setDeletingItemId(criterion.id)
                          setDeletingItemType('criteria')
                        }}
                          className="text-red-600 hover:text-red-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        title="Delete criteria"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No scoring criteria defined yet
            {user && event.user && user.id === event.user.id && (
              <button
                onClick={() => setIsAddCriteriaModalOpen(true)}
                className="block mx-auto mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 font-medium"
              >
                Add First Criteria
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingItemId && deletingItemType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Confirm Delete</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Are you sure you want to delete this {deletingItemType}? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 justify-end">
              <button
                onClick={() => {
                  setDeletingItemId(null)
                  setDeletingItemType(null)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* QR Modal for judge scoring link (public, easy to scan) */}
      {qrModalJudgeId && event && (
        (() => {
          const judge = event.judges?.find((j) => j.id === qrModalJudgeId)
          if (!judge) return null
          const url = `${window.location.origin}/judge/${encodeURIComponent(judge.code)}`
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Scan to open scoring</h3>
                    <p className="text-sm text-gray-600">Scan this QR with the judge device or open the link below.</p>
                  </div>
                  <button onClick={() => setQrModalJudgeId(null)} className="text-gray-500 hover:text-gray-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex flex-col items-center gap-4">
                  <div className="p-2 bg-white rounded">
                    <QRCode value={url} size={320} />
                  </div>

                  <div className="w-full">
                    <label className="block text-xs text-gray-500 mb-1">Scoring link</label>
                    <div className="flex items-center gap-2">
                      <input readOnly value={url} className="flex-1 px-3 py-2 border rounded text-sm" />
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(url)
                            // minimal feedback
                            alert('Link copied to clipboard')
                          } catch {
                            // fallback: select
                            const el: any = document.querySelector('input[readonly][value="' + url + '"]')
                            if (el) el.select()
                          }
                        }}
                        className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()
      )}
      {event && (
        <>
          <EditEventModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleRefresh}
            eventId={event.id}
            initialName={event.name}
            initialDescription={event.description || undefined}
          />
          <AddContestantModal
            isOpen={isAddContestantModalOpen}
            onClose={() => setIsAddContestantModalOpen(false)}
            onSuccess={handleRefresh}
            eventId={event.id}
          />
          <AddJudgeModal
            isOpen={isAddJudgeModalOpen}
            onClose={() => setIsAddJudgeModalOpen(false)}
            onSuccess={handleRefresh}
            eventId={event.id}
          />
          <AddCriteriaModal
            isOpen={isAddCriteriaModalOpen}
            onClose={() => setIsAddCriteriaModalOpen(false)}
            onSuccess={handleRefresh}
            eventId={event.id}
          />
          <EditContestantModal
            isOpen={isEditContestantOpen}
            onClose={() => {
              setIsEditContestantOpen(false)
              setEditingContestantId(null)
              setEditingContestantName('')
            }}
            onSuccess={handleRefresh}
            contestantId={editingContestantId || 0}
            initialName={editingContestantName}
          />
          <EditJudgeModal
            isOpen={isEditJudgeOpen}
            onClose={() => {
              setIsEditJudgeOpen(false)
              setEditingJudgeId(null)
              setEditingJudgeName('')
            }}
            onSuccess={handleRefresh}
            judgeId={editingJudgeId || 0}
            initialName={editingJudgeName}
          />
          <EditCriteriaModal
            isOpen={isEditCriteriaOpen}
            onClose={() => {
              setIsEditCriteriaOpen(false)
              setEditingCriteriaId(null)
              setEditingCriteriaName('')
              setEditingCriteriaPercentage(0)
            }}
            onSuccess={handleRefresh}
            criteriaId={editingCriteriaId || 0}
            initialName={editingCriteriaName}
            initialPercentage={editingCriteriaPercentage}
          />
        </>
      )}
    </div>
  )
}
