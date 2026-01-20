import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProjectsStore, useTasksStore, useUsersStore } from './index'

export type ReportType = 'project_summary' | 'budget_analysis' | 'team_performance' | 'task_completion'
export type DateRange = '7days' | '30days' | '90days' | 'all'

export interface ProjectReport {
  projectId: string
  projectName: string
  status: string
  progress: number
  budget: number
  spent: number
  tasksTotal: number
  tasksCompleted: number
  teamSize: number
  daysRemaining: number
  isOnTrack: boolean
}

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  utilizationRate: number
  projectsBudgets: Array<{
    projectName: string
    budget: number
    spent: number
    percentage: number
  }>
}

export interface TeamPerformance {
  totalMembers: number
  activeMembers: number
  tasksPerMember: number
  completionRate: number
  topPerformers: Array<{
    name: string
    tasksCompleted: number
    projects: number
  }>
}

export const useReportsStore = defineStore('reports', () => {
  const projectsStore = useProjectsStore()
  const tasksStore = useTasksStore()
  const usersStore = useUsersStore()
  
  const isLoading = ref(false)
  const selectedDateRange = ref<DateRange>('30days')

  // Project Reports
  const projectReports = computed((): ProjectReport[] => {
    return projectsStore.projects.map(project => {
      const projectTasks = tasksStore.tasks.filter(t => t.projectId === project.id)
      const completedTasks = projectTasks.filter(t => t.status === 'done')
      
      const endDate = new Date(project.endDate)
      const now = new Date()
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      const isOnTrack = project.progress >= ((100 - daysRemaining) / 100) * 100 || project.status === 'completed'
      
      return {
        projectId: project.id,
        projectName: project.title,
        status: project.status,
        progress: project.progress,
        budget: project.budget,
        spent: project.spent,
        tasksTotal: projectTasks.length,
        tasksCompleted: completedTasks.length,
        teamSize: project.teamMembers.length,
        daysRemaining: Math.max(0, daysRemaining),
        isOnTrack
      }
    })
  })

  // Budget Analysis
  const budgetSummary = computed((): BudgetSummary => {
    const totalBudget = projectsStore.totalBudget
    const totalSpent = projectsStore.totalSpent
    const totalRemaining = totalBudget - totalSpent
    const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    const projectsBudgets = projectsStore.projects.map(p => ({
      projectName: p.title,
      budget: p.budget,
      spent: p.spent,
      percentage: p.budget > 0 ? (p.spent / p.budget) * 100 : 0
    })).sort((a, b) => b.spent - a.spent)

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      utilizationRate,
      projectsBudgets
    }
  })

  // Team Performance
  const teamPerformance = computed((): TeamPerformance => {
    const totalMembers = usersStore.users.length
    const activeMembers = usersStore.users.filter(u => u.status === 'active').length
    const totalTasks = tasksStore.tasks.length
    const tasksPerMember = totalMembers > 0 ? totalTasks / totalMembers : 0
    
    const completedTasks = tasksStore.tasks.filter(t => t.status === 'done').length
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Mock top performers (in real app, calculate from actual task assignments)
    const topPerformers = [
      { name: 'Alice Tan', tasksCompleted: 12, projects: 2 },
      { name: 'Bob Lee', tasksCompleted: 10, projects: 2 },
      { name: 'Charlie Wong', tasksCompleted: 8, projects: 1 }
    ]

    return {
      totalMembers,
      activeMembers,
      tasksPerMember: Math.round(tasksPerMember * 10) / 10,
      completionRate: Math.round(completionRate),
      topPerformers
    }
  })

  // Task Statistics
  const taskStatistics = computed(() => {
    const total = tasksStore.tasks.length
    const byStatus = tasksStore.tasksByStatus
    
    return {
      total,
      todo: byStatus.todo.length,
      inProgress: byStatus['in-progress'].length,
      review: byStatus.review.length,
      done: byStatus.done.length,
      completionRate: total > 0 ? Math.round((byStatus.done.length / total) * 100) : 0
    }
  })

  // Projects by Status
  const projectsByStatus = computed(() => {
    return {
      active: projectsStore.projectsByStatus.active.length,
      onHold: projectsStore.projectsByStatus['on-hold'].length,
      completed: projectsStore.projectsByStatus.completed.length,
      draft: projectsStore.projectsByStatus.draft.length
    }
  })

  // Generate Report
  const generateReport = async (reportType: ReportType) => {
    isLoading.value = true
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real app, this would call an API to generate PDF/Excel
      const reportData = {
        type: reportType,
        dateRange: selectedDateRange.value,
        generatedAt: new Date().toISOString(),
        data: reportType === 'project_summary' ? projectReports.value :
              reportType === 'budget_analysis' ? budgetSummary.value :
              reportType === 'team_performance' ? teamPerformance.value :
              taskStatistics.value
      }
      
      console.log('Report generated:', reportData)
      return { success: true, data: reportData }
    } catch (error) {
      console.error('Generate report error:', error)
      return { success: false, error: 'Failed to generate report' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    isLoading,
    selectedDateRange,
    // Computed
    projectReports,
    budgetSummary,
    teamPerformance,
    taskStatistics,
    projectsByStatus,
    // Actions
    generateReport
  }
})