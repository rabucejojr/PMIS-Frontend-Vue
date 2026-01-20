import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ProjectStatus = 'draft' | 'active' | 'on-hold' | 'completed' | 'archived'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Project {
  id: string
  title: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate: string
  endDate: string
  budget: number
  spent: number
  progress: number
  projectManager: string
  department: string
  teamMembers: string[]
  createdAt: string
  updatedAt: string
}

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const isLoading = ref(false)
  const currentProject = ref<Project | null>(null)

  // Getters
  const activeProjects = computed(() => 
    projects.value.filter(p => p.status === 'active')
  )
  
  const completedProjects = computed(() => 
    projects.value.filter(p => p.status === 'completed')
  )
  
  const projectsByStatus = computed(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      draft: [],
      active: [],
      'on-hold': [],
      completed: [],
      archived: []
    }
    
    projects.value.forEach(project => {
      grouped[project.status].push(project)
    })
    
    return grouped
  })

  const totalBudget = computed(() => 
    projects.value.reduce((sum, p) => sum + p.budget, 0)
  )

  const totalSpent = computed(() => 
    projects.value.reduce((sum, p) => sum + p.spent, 0)
  )

  // Actions
  const fetchProjects = async () => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      projects.value = [
        {
          id: '1',
          title: 'Digital Transformation Initiative',
          description: 'Modernizing DOST systems and processes',
          status: 'active',
          priority: 'high',
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          budget: 5000000,
          spent: 2500000,
          progress: 65,
          projectManager: 'Juan Dela Cruz',
          department: 'IT Department',
          teamMembers: ['Alice', 'Bob', 'Charlie'],
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18'
        },
        {
          id: '2',
          title: 'Research and Development Program',
          description: 'Supporting local innovation and research',
          status: 'active',
          priority: 'critical',
          startDate: '2024-02-01',
          endDate: '2024-11-30',
          budget: 8000000,
          spent: 3200000,
          progress: 45,
          projectManager: 'Maria Santos',
          department: 'R&D Department',
          teamMembers: ['David', 'Eve'],
          createdAt: '2024-01-20',
          updatedAt: '2024-01-18'
        },
        {
          id: '3',
          title: 'Community Outreach Program',
          description: 'Science and technology awareness campaign',
          status: 'completed',
          priority: 'medium',
          startDate: '2023-06-01',
          endDate: '2023-12-31',
          budget: 1500000,
          spent: 1450000,
          progress: 100,
          projectManager: 'Pedro Garcia',
          department: 'Community Relations',
          teamMembers: ['Frank', 'Grace'],
          createdAt: '2023-05-15',
          updatedAt: '2024-01-05'
        }
      ]

      return { success: true }
    } catch (error) {
      console.error('Fetch projects error:', error)
      return { success: false, error: 'Failed to fetch projects' }
    } finally {
      isLoading.value = false
    }
  }

  const fetchProjectById = async (id: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const project = projects.value.find(p => p.id === id)
      currentProject.value = project || null
      
      return { success: true, data: project }
    } catch (error) {
      console.error('Fetch project error:', error)
      return { success: false, error: 'Failed to fetch project' }
    } finally {
      isLoading.value = false
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      projects.value.push(newProject)
      
      return { success: true, data: newProject }
    } catch (error) {
      console.error('Create project error:', error)
      return { success: false, error: 'Failed to create project' }
    } finally {
      isLoading.value = false
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = {
          ...projects.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        
        return { success: true, data: projects.value[index] }
      }
      
      return { success: false, error: 'Project not found' }
    } catch (error) {
      console.error('Update project error:', error)
      return { success: false, error: 'Failed to update project' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteProject = async (id: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value.splice(index, 1)
        return { success: true }
      }
      
      return { success: false, error: 'Project not found' }
    } catch (error) {
      console.error('Delete project error:', error)
      return { success: false, error: 'Failed to delete project' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    projects,
    isLoading,
    currentProject,
    // Getters
    activeProjects,
    completedProjects,
    projectsByStatus,
    totalBudget,
    totalSpent,
    // Actions
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject
  }
})