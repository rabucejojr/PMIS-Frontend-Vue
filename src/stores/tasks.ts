import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

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
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)

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

  const mapTask = (apiTask: any): Task => ({
    id: apiTask.id?.toString() ?? '',
    title: apiTask.title ?? '',
    description: apiTask.description ?? '',
    status: apiTask.status ?? 'todo',
    priority: apiTask.priority ?? 'medium',
    projectId: apiTask.project_id?.toString() ?? '',
    assignedTo: apiTask.assigned_to ?? [],
    dueDate: apiTask.due_date ?? '',
    createdBy: apiTask.created_by?.toString() ?? '',
    createdAt: apiTask.created_at ?? '',
    updatedAt: apiTask.updated_at ?? '',
    tags: apiTask.tags ?? []
  })

  const fetchTasks = async (projectId?: string) => {
    isLoading.value = true
    try {
      const params = projectId ? { project_id: projectId } : {}
      const response = await api.get('/tasks', { params })
      tasks.value = response.data.map(mapTask)
      return { success: true }
    } catch (error: any) {
      console.error('Fetch tasks error:', error)
      return { success: false, error: 'Failed to fetch tasks' }
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (taskData: any) => {
    isLoading.value = true
    try {
      const payload = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        project_id: taskData.projectId,
        assigned_to: taskData.assignedTo,
        due_date: taskData.dueDate,
        tags: taskData.tags,
      }

      const response = await api.post('/tasks', payload)
      const newTask = mapTask(response.data)
      tasks.value.push(newTask)
      
      return { success: true, data: newTask }
    } catch (error: any) {
      console.error('Create task error:', error)
      return { success: false, error: 'Failed to create task' }
    } finally {
      isLoading.value = false
    }
  }

  const updateTask = async (id: string, updates: any) => {
    isLoading.value = true
    try {
      const payload: any = {}
      if (updates.title !== undefined) payload.title = updates.title
      if (updates.description !== undefined) payload.description = updates.description
      if (updates.status !== undefined) payload.status = updates.status
      if (updates.priority !== undefined) payload.priority = updates.priority
      if (updates.projectId !== undefined) payload.project_id = updates.projectId
      if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo
      if (updates.dueDate !== undefined) payload.due_date = updates.dueDate
      if (updates.tags !== undefined) payload.tags = updates.tags

      const response = await api.put(`/tasks/${id}`, payload)
      const updatedTask = mapTask(response.data)

      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }

      return { success: true, data: updatedTask }
    } catch (error: any) {
      console.error('Update task error:', error)
      return { success: false, error: 'Failed to update task' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteTask = async (id: string) => {
    isLoading.value = true
    try {
      await api.delete(`/tasks/${id}`)
      
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('Delete task error:', error)
      return { success: false, error: 'Failed to delete task' }
    } finally {
      isLoading.value = false
    }
  }

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    isLoading.value = true
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status })
      const updatedTask = mapTask(response.data)
      
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      
      return { success: true, data: updatedTask }
    } catch (error: any) {
      console.error('Update task status error:', error)
      return { success: false, error: 'Failed to update task status' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    tasks,
    isLoading,
    tasksByStatus,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  }
})