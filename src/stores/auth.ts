import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  username: string
  role: 'admin' | 'project_manager' | 'staff' | 'viewer'
  department?: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isProjectManager = computed(() => 
    user.value?.role === 'admin' || user.value?.role === 'project_manager'
  )

  // Dummy credentials
  const DUMMY_ACCOUNTS = [
    {
      email: 'admin@dost.gov.ph',
      password: 'admin123',
      user: {
        id: '1',
        email: 'admin@dost.gov.ph',
        username: 'admin',
        role: 'admin' as const,
        department: 'DOST Surigao del Norte'
      }
    },
    {
      email: 'manager@dost.gov.ph',
      password: 'manager123',
      user: {
        id: '2',
        email: 'manager@dost.gov.ph',
        username: 'manager',
        role: 'project_manager' as const,
        department: 'Project Management'
      }
    },
    {
      email: 'staff@dost.gov.ph',
      password: 'staff123',
      user: {
        id: '3',
        email: 'staff@dost.gov.ph',
        username: 'staff',
        role: 'staff' as const,
        department: 'IT Department'
      }
    }
  ]

  // Actions
  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check dummy credentials
      const account = DUMMY_ACCOUNTS.find(
        acc => acc.email === email && acc.password === password
      )

      if (!account) {
        return { 
          success: false, 
          error: 'Invalid email or password' 
        }
      }

      const mockToken = 'mock-jwt-token-' + Date.now()

      user.value = account.user
      token.value = mockToken
      
      // Persist to localStorage
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(account.user))

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (username: string, email: string, _password: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: '1',
        email,
        username,
        role: 'staff',
        department: 'DOST Surigao del Norte'
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()

      user.value = mockUser
      token.value = mockToken
      
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      return { success: true }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Registration failed' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const initAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isProjectManager,
    // Actions
    login,
    register,
    logout,
    initAuth,
  }
})