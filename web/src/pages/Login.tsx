import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/events')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {isRegister ? 'Register' : 'Login'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          {isRegister && (
            <input
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={isRegister}
            />
          )}

          <input
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isRegister && (
            <input
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirm Password"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required={isRegister}
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white p-3 rounded font-medium disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-indigo-600 hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-indigo-600 hover:underline"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
