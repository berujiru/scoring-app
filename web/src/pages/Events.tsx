import React from 'react'
import { Link } from 'react-router-dom'

export default function Events() {
  // Placeholder static data for initial scaffold
  const events = [
    { id: 1, name: 'Science Fair 2025' },
    { id: 2, name: 'Art Showcase' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Events</h2>
        <button className="text-sm text-indigo-600">New</button>
      </div>

      <ul className="space-y-3">
        {events.map((e) => (
          <li key={e.id} className="bg-white p-3 rounded shadow-sm">
            <Link to={`/events/${e.id}`} className="block font-medium">{e.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
