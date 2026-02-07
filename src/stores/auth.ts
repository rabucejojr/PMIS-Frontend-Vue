import api from '@/services/api'
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

type AuthResult = { success: true } | { success: false; error: string }

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

  // Helper function to save auth data to state and localStorage
  const saveAuthData = (userData: User, authToken: string) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

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
  const login = async (email: string, password: string): Promise<AuthResult> => {
    isLoading.value = true
    try {
      // Try API login with 10 second timeout
      const response = await api.post('/login', { email, password }, { timeout: 10000 })

      saveAuthData(response.data.user, response.data.token)
      return { success: true }
    } catch (error: any) {
      // Fallback to dummy accounts for testing
      const account = DUMMY_ACCOUNTS.find(
        (a) => a.email === email && a.password === password
      )

      if (account) {
        saveAuthData(account.user, 'dummy_token_' + account.user.id)
        return { success: true }
      }

      // Return specific error message if available
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Invalid email or password'

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<AuthResult> => {
    isLoading.value = true
    try {
      // Try API register with 10 second timeout
      const response = await api.post('/register', {
        email,
        username,
        password,
        full_name: username,
        department: 'DOST Surigao del Norte',
        position: 'Staff'
      }, { timeout: 10000 })

      saveAuthData(response.data.user, response.data.token)
      return { success: true }
    } catch (error: any) {
      // Fallback: create a dummy user for testing
      const newUser: User = {
        id: Date.now().toString(),
        email,
        username,
        role: 'staff',
        department: 'DOST Surigao del Norte'
      }

      saveAuthData(newUser, 'dummy_token_' + newUser.id)
      return { success: true }
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
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch {
        // Clear corrupted data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        token.value = null
        user.value = null
      }
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