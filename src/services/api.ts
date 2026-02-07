import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 5000, // 5 second timeout for all requests
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if we're not already on the login page
    // and if it's not the login/register endpoint itself
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/login') ||
                            error.config?.url?.includes('/register')

      if (!isAuthEndpoint && !window.location.pathname.includes('/auth')) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        router.push({ name: 'login' })
      }
    }
    return Promise.reject(error)
  }
)

export default api