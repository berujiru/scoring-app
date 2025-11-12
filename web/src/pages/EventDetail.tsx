import React from 'react'
import { useParams } from 'react-router-dom'

export default function EventDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow-sm">
        <h2 className="font-semibold">Event {id}</h2>
        <p className="text-sm text-gray-600 mt-2">Event details and contestants will appear here.</p>
      </div>
    </div>
  )
}
