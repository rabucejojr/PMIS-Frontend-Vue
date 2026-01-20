import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  // State
  const users = ref<UserProfile[]>([])
  const isLoading = ref(false)

  // Actions
  const fetchUsers = async () => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      users.value = [
        {
          id: '1',
          email: 'admin@dost.gov.ph',
          username: 'admin',
          fullName: 'Juan Dela Cruz',
          role: 'admin',
          department: 'Administration',
          position: 'System Administrator',
          status: 'active',
          phone: '+63 912 345 6789',
          joinedAt: '2023-01-15',
          lastActive: '2024-01-18'
        },
        {
          id: '2',
          email: 'maria.santos@dost.gov.ph',
          username: 'msantos',
          fullName: 'Maria Santos',
          role: 'project_manager',
          department: 'R&D Department',
          position: 'Project Manager',
          status: 'active',
          phone: '+63 917 234 5678',
          joinedAt: '2023-03-20',
          lastActive: '2024-01-18'
        },
        {
          id: '3',
          email: 'pedro.garcia@dost.gov.ph',
          username: 'pgarcia',
          fullName: 'Pedro Garcia',
          role: 'project_manager',
          department: 'Community Relations',
          position: 'Project Coordinator',
          status: 'active',
          phone: '+63 918 345 6789',
          joinedAt: '2023-06-10',
          lastActive: '2024-01-17'
        },
        {
          id: '4',
          email: 'alice.tan@dost.gov.ph',
          username: 'atan',
          fullName: 'Alice Tan',
          role: 'staff',
          department: 'IT Department',
          position: 'Software Developer',
          status: 'active',
          joinedAt: '2023-08-01',
          lastActive: '2024-01-18'
        },
        {
          id: '5',
          email: 'bob.lee@dost.gov.ph',
          username: 'blee',
          fullName: 'Bob Lee',
          role: 'staff',
          department: 'IT Department',
          position: 'Frontend Developer',
          status: 'active',
          joinedAt: '2023-09-15',
          lastActive: '2024-01-16'
        },
        {
          id: '6',
          email: 'charlie.wong@dost.gov.ph',
          username: 'cwong',
          fullName: 'Charlie Wong',
          role: 'staff',
          department: 'IT Department',
          position: 'Backend Developer',
          status: 'active',
          joinedAt: '2023-10-01',
          lastActive: '2024-01-18'
        },
        {
          id: '7',
          email: 'david.reyes@dost.gov.ph',
          username: 'dreyes',
          fullName: 'David Reyes',
          role: 'viewer',
          department: 'R&D Department',
          position: 'Research Assistant',
          status: 'active',
          joinedAt: '2023-11-20',
          lastActive: '2024-01-15'
        },
        {
          id: '8',
          email: 'eve.cruz@dost.gov.ph',
          username: 'ecruz',
          fullName: 'Eve Cruz',
          role: 'viewer',
          department: 'Community Relations',
          position: 'Community Officer',
          status: 'pending',
          joinedAt: '2024-01-10',
          lastActive: '2024-01-12'
        }
      ]

      return { success: true }
    } catch (error) {
      console.error('Fetch users error:', error)
      return { success: false, error: 'Failed to fetch users' }
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserById = async (id: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const user = users.value.find(u => u.id === id)
      
      return { success: true, data: user }
    } catch (error) {
      console.error('Fetch user error:', error)
      return { success: false, error: 'Failed to fetch user' }
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (userData: Omit<UserProfile, 'id' | 'joinedAt' | 'lastActive'>) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newUser: UserProfile = {
        ...userData,
        id: Date.now().toString(),
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      }
      
      users.value.push(newUser)
      
      return { success: true, data: newUser }
    } catch (error) {
      console.error('Create user error:', error)
      return { success: false, error: 'Failed to create user' }
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (id: string, updates: Partial<Omit<UserProfile, 'id' | 'joinedAt' | 'lastActive'>>) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          ...updates,
          lastActive: new Date().toISOString()
        } as UserProfile
        const updatedUser = users.value[index]
        
        return { success: true, data: updatedUser }
      }
      
      return { success: false, error: 'User not found' }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: 'Failed to update user' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value.splice(index, 1)
        return { success: true }
      }
      
      return { success: false, error: 'User not found' }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error: 'Failed to delete user' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    users,
    isLoading,
    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser
  }
})