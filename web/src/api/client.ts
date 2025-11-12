import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    const isAuthEndpoint = original.url?.includes('/auth/login') || original.url?.includes('/auth/register')
    
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        
        const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
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
