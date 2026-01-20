import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assignedTo: string[]
  dueDate: string
  createdBy: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)

  // Getters
  const tasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'review': [],
      'done': []
    }
    
    tasks.value.forEach(task => {
      grouped[task.status].push(task)
    })
    
    return grouped
  })

  const tasksByProject = (projectId: string) => {
    return tasks.value.filter(t => t.projectId === projectId)
  }

  const overdueTasks = computed(() => {
    const now = new Date()
    return tasks.value.filter(t => 
      t.status !== 'done' && new Date(t.dueDate) < now
    )
  })

  const myTasks = (userId: string) => {
    return tasks.value.filter(t => t.assignedTo.includes(userId))
  }

  // Actions
  const fetchTasks = async (projectId?: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      tasks.value = [
        {
          id: '1',
          title: 'Design system architecture',
          description: 'Create technical design documents',
          status: 'in-progress',
          priority: 'high',
          projectId: '1',
          assignedTo: ['Alice', 'Bob'],
          dueDate: '2024-02-15',
          createdBy: 'Admin',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          tags: ['architecture', 'design']
        },
        {
          id: '2',
          title: 'Implement authentication',
          description: 'Build login and registration system',
          status: 'done',
          priority: 'high',
          projectId: '1',
          assignedTo: ['Charlie'],
          dueDate: '2024-01-20',
          createdBy: 'Admin',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-17',
          tags: ['auth', 'security']
        },
        {
          id: '3',
          title: 'Database schema design',
          description: 'Design and implement database models',
          status: 'review',
          priority: 'medium',
          projectId: '1',
          assignedTo: ['Alice'],
          dueDate: '2024-02-10',
          createdBy: 'Admin',
          createdAt: '2024-01-12',
          updatedAt: '2024-01-18',
          tags: ['database']
        },
        {
          id: '4',
          title: 'Setup testing framework',
          description: 'Configure unit and integration tests',
          status: 'todo',
          priority: 'medium',
          projectId: '1',
          assignedTo: ['Bob'],
          dueDate: '2024-02-20',
          createdBy: 'Admin',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
          tags: ['testing']
        }
      ]

      if (projectId) {
        tasks.value = tasks.value.filter(t => t.projectId === projectId)
      }

      return { success: true }
    } catch (error) {
      console.error('Fetch tasks error:', error)
      return { success: false, error: 'Failed to fetch tasks' }
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      tasks.value.push(newTask)
      
      return { success: true, data: newTask }
    } catch (error) {
      console.error('Create task error:', error)
      return { success: false, error: 'Failed to create task' }
    } finally {
      isLoading.value = false
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        const updatedTask = {
          ...tasks.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        tasks.value[index] = updatedTask
        
        return { success: true, data: updatedTask }
      }
      
      return { success: false, error: 'Task not found' }
    } catch (error) {
      console.error('Update task error:', error)
      return { success: false, error: 'Failed to update task' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteTask = async (id: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
        return { success: true }
      }
      
      return { success: false, error: 'Task not found' }
    } catch (error) {
      console.error('Delete task error:', error)
      return { success: false, error: 'Failed to delete task' }
    } finally {
      isLoading.value = false
    }
  }

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    return updateTask(id, { status })
  }

  return {
    // State
    tasks,
    isLoading,
    // Getters
    tasksByStatus,
    tasksByProject,
    overdueTasks,
    myTasks,
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  }
})