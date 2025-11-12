import axios, { AxiosRequestConfig } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with cross-origin requests
  timeout: 10000, // 10 second timeout
})

// Attach auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    // Don't retry auth endpoints to prevent infinite loops
    const isAuthEndpoint = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register')
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message)
      return Promise.reject(error)
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !original?._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        
        // Use the same axios instance to maintain config
        const response = await apiClient.post('/auth/refresh', { refreshToken }, {
          skipAuthRefresh: true // Add custom flag to prevent infinite loops
        })
        
        const { accessToken, refreshToken: newRefreshToken } = response.data
        
        // Update tokens
        localStorage.setItem('accessToken', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }
        
        // Retry the original request with new token
        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(original)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Clear auth state and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session=expired'
        }
        return Promise.reject(refreshError)
      }
    }
    
    // Handle other error statuses
    if (error.response?.status === 403) {
      console.error('Forbidden:', error.response.data)
      // Optionally redirect to login or show access denied
    }
    
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authApi = {
  register: (email: string, name: string, password: string, passwordConfirm: string) =>
    apiClient.post('/auth/register', { email, name, password, passwordConfirm }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  refresh: () =>
    apiClient.post('/auth/refresh', {}),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  logout: () =>
    apiClient.post('/auth/logout', {}),
}

// Events endpoints
export const eventsApi = {
  getAll: () =>
    apiClient.get('/events'),

  getById: (id: number) =>
    apiClient.get(`/events/${id}`),

  create: (data: any) =>
    apiClient.post('/events', data),

  update: (id: number, data: any) =>
    apiClient.put(`/events/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/events/${id}`),
}

// Contestants endpoints
export const contestantsApi = {
  getByEvent: (eventId: number) =>
    apiClient.get(`/contestants/event/${eventId}`),

  getById: (id: number) =>
    apiClient.get(`/contestants/${id}`),

  create: (data: { name: string; eventId: number }) =>
    apiClient.post('/contestants', data),

  update: (id: number, data: any) =>
    apiClient.put(`/contestants/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/contestants/${id}`),
}

// Judges endpoints
export const judgesApi = {
  getByEvent: (eventId: number) =>
    apiClient.get(`/judges/event/${eventId}`),

  getById: (id: number) =>
    apiClient.get(`/judges/${id}`),

  // Public lookup by unique code (used for judge scoring links)
  getByCode: (code: string) =>
    apiClient.get(`/judges/code/${encodeURIComponent(code)}`),

  create: (data: { name: string; eventId: number; userId: number }) =>
    apiClient.post('/judges', data),

  update: (id: number, data: any) =>
    apiClient.put(`/judges/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/judges/${id}`),
}

// Judging endpoints
export const judgingApi = {
  // Submit a single criterion score authenticated by judge code (public)
  submitByCode: (data: { score: number; eventId: number; contestantId: number; criteriaId: number; judgeCode: string }) =>
    apiClient.post('/judging/by-code', data),

  // Get existing judging scores by judge code and event (public)
  getScoresByCode: (judgeCode: string, eventId: number) =>
    apiClient.get(`/judging/by-code/${encodeURIComponent(judgeCode)}/event/${eventId}`),

  // Get tally/rankings for an event
  getTallyByEvent: (eventId: number) =>
    apiClient.get(`/judging/event/${eventId}/tally`),
}

// Criteria endpoints
export const criteriaApi = {
  getByEvent: (eventId: number) =>
    apiClient.get(`/criteria/event/${eventId}`),

  getById: (id: number) =>
    apiClient.get(`/criteria/${id}`),

  create: (data: { name: string; percentage: number; eventId: number }) =>
    apiClient.post('/criteria', data),

  update: (id: number, data: any) =>
    apiClient.put(`/criteria/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/criteria/${id}`),
}
