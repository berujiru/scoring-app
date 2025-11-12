import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsApi } from '../api/client'
import { EventCardData } from '../components/EventCard'

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventCardData & {
    contestants?: Array<{ id: number; name: string }>
    judges?: Array<{ id: number; name: string }>
    criteria?: Array<{ id: number; name: string; percentage: number }>
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Edit
          </button>
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Contestants</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {event.contestants && event.contestants.length > 0 ? (
              event.contestants.map((contestant) => (
                <div key={contestant.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <p className="text-gray-900 font-medium">{contestant.name}</p>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    ID: {contestant.id}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No contestants yet
              </div>
            )}
          </div>
        </div>

        {/* Judges Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Judges</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {event.judges && event.judges.length > 0 ? (
              event.judges.map((judge) => (
                <div key={judge.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <p className="text-gray-900 font-medium">{judge.name}</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    ID: {judge.id}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No judges yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Criteria Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Scoring Criteria</h3>
        </div>
        {event.criteria && event.criteria.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {event.criteria.map((criterion) => (
              <div key={criterion.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{criterion.name}</p>
                  <p className="text-sm text-gray-600">Weight: {criterion.percentage}%</p>
                </div>
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
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No scoring criteria defined yet
          </div>
        )}
      </div>
    </div>
  )
}
