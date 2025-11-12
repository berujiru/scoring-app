import { useState, useEffect, useCallback } from 'react'
import { eventsApi } from '../api/client'
import { EventCardData } from '../components/EventCard'

export interface UseEventsResult {
  events: EventCardData[]
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  searchQuery: string
  setSearchQuery: (query: string) => void
  goToPage: (page: number) => void
  refetch: () => Promise<void>
}

const ITEMS_PER_PAGE = 6

/**
 * Custom hook to manage events data fetching with search and pagination
 */
export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<EventCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [allEvents, setAllEvents] = useState<EventCardData[]>([])

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await eventsApi.getAll()
      const data = response.data as EventCardData[]

      // Filter events based on search query
      const filtered = data.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setAllEvents(filtered)
      setCurrentPage(1) // Reset to first page on search
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Calculate pagination
  const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedEvents = allEvents.slice(startIdx, endIdx)

  return {
    events: paginatedEvents,
    isLoading,
    error,
    totalPages,
    currentPage,
    searchQuery,
    setSearchQuery,
    goToPage: setCurrentPage,
    refetch: fetchEvents,
  }
}
