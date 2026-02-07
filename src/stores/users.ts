import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export type UserRole = 'admin' | 'project_manager' | 'staff' | 'viewer'
export type UserStatus = 'active' | 'inactive' | 'pending'

export interface UserProfile {
  id: string
  email: string
  username: string
  fullName: string
  role: UserRole
  department: string
  position: string
  status: UserStatus
  avatar?: string
  phone?: string
  joinedAt: string
  lastActive: string
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserProfile[]>([])
  const isLoading = ref(false)
  const currentUser = ref<UserProfile | null>(null)

  const mapUser = (apiUser: any): UserProfile => ({
    id: apiUser.id?.toString() ?? '',
    email: apiUser.email ?? '',
    username: apiUser.username ?? '',
    fullName: apiUser.full_name ?? '',
    role: apiUser.role ?? 'staff',
    department: apiUser.department ?? '',
    position: apiUser.position ?? '',
    status: apiUser.status ?? 'pending',
    avatar: apiUser.avatar,
    phone: apiUser.phone,
    joinedAt: apiUser.created_at ?? '',
    lastActive: apiUser.updated_at ?? ''
  })

  const fetchUsers = async (forceRefresh = false) => {
    // Use cached data if available (unless forcing refresh)
    if (!forceRefresh && users.value.length > 0) {
      return { success: true }
    }

    isLoading.value = true
    try {
      const response = await api.get('/users')
      const usersData = response.data.data || response.data
      users.value = Array.isArray(usersData) ? usersData.map(mapUser) : []
      return { success: true }
    } catch (error: any) {
      console.error('Fetch users error:', error)
      return { success: false, error: 'Failed to fetch users' }
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserById = async (id: string, forceRefresh = false) => {
    // Check if user is already in cache (unless forcing refresh)
    if (!forceRefresh) {
      const cachedUser = users.value.find((u) => u.id === id)
      if (cachedUser) {
        currentUser.value = cachedUser
        return { success: true, data: currentUser.value }
      }
    }

    isLoading.value = true
    currentUser.value = null
    try {
      const response = await api.get(`/users/${id}`)
      const userData = response.data.data || response.data
      currentUser.value = mapUser(userData)

      // Update the users array cache if the user exists there
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = currentUser.value
      } else {
        users.value.push(currentUser.value)
      }

      return { success: true, data: currentUser.value }
    } catch (error: any) {
      console.error('Fetch user error:', error)
      currentUser.value = null
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user',
      }
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (userData: any) => {
    if (!userData.password) {
      return { success: false, error: 'Password is required' }
    }

    isLoading.value = true
    try {
      const payload = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        full_name: userData.fullName,
        role: userData.role,
        department: userData.department,
        position: userData.position,
        status: userData.status,
        phone: userData.phone
      }

      const response = await api.post('/users', payload)
      const newUser = mapUser(response.data)
      users.value.push(newUser)

      return { success: true, data: newUser }
    } catch (error: any) {
      console.error('Create user error:', error)
      return { success: false, error: 'Failed to create user' }
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (id: string, updates: any) => {
    isLoading.value = true
    try {
      const payload: any = {}
      if (updates.email !== undefined) payload.email = updates.email
      if (updates.username !== undefined) payload.username = updates.username
      if (updates.fullName !== undefined) payload.full_name = updates.fullName
      if (updates.role !== undefined) payload.role = updates.role
      if (updates.department !== undefined) payload.department = updates.department
      if (updates.position !== undefined) payload.position = updates.position
      if (updates.status !== undefined) payload.status = updates.status
      if (updates.phone !== undefined) payload.phone = updates.phone

      const response = await api.put(`/users/${id}`, payload)
      const updatedUser = mapUser(response.data)

      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }

      return { success: true, data: updatedUser }
    } catch (error: any) {
      console.error('Update user error:', error)
      return { success: false, error: 'Failed to update user' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    isLoading.value = true
    try {
      await api.delete(`/users/${id}`)
      
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value.splice(index, 1)
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('Delete user error:', error)
      return { success: false, error: 'Failed to delete user' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    isLoading,
    currentUser,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser
  }
})