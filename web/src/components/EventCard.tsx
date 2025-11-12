import React from 'react'
import { Link } from 'react-router-dom'

export interface EventCardData {
  id: number
  name: string
  description?: string | null
  active: boolean
  createdAt: string
  user?: {
    id: number
    name: string
    email: string
  }
  _count?: {
    contestants: number
    judges: number
    criteria: number
  }
}

interface EventCardProps {
  event: EventCardData
}

/**
 * Reusable EventCard component - displays event information in a card format
 */
export function EventCard({ event }: EventCardProps) {
  const createdDate = new Date(event.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link
      to={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden hover:border-indigo-300"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg flex-1 line-clamp-2">
            {event.name}
          </h3>
          {event.active && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
              Active
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 mb-3">
          {event.user && (
            <p className="text-xs text-gray-500">
              Created by <span className="font-medium text-gray-700">{event.user.name}</span>
            </p>
          )}
          <p className="text-xs text-gray-500">{createdDate}</p>
        </div>

        {event._count && (
          <div className="flex gap-4 pt-3 border-t border-gray-100">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Contestants</p>
              <p className="text-lg font-semibold text-gray-900">
                {event._count.contestants}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Judges</p>
              <p className="text-lg font-semibold text-gray-900">
                {event._count.judges}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Criteria</p>
              <p className="text-lg font-semibold text-gray-900">
                {event._count.criteria}
              </p>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
