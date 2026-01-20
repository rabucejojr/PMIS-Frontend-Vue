// Export all stores for easy importing
export { useAuthStore } from './auth'
export type { User } from './auth'

export { useProjectsStore } from './projects'
export type { Project, ProjectStatus, ProjectPriority } from './projects'

export { useTasksStore } from './tasks'
export type { Task, TaskStatus, TaskPriority } from './tasks'

export { useUsersStore } from './users'
export type { UserProfile, UserRole, UserStatus } from './users'

export { useDocumentsStore } from './documents'
export type { Document, DocumentCategory } from './documents'

export { useSettingsStore } from './settings'
export type { Theme, NotificationSettings, UserPreferences } from './settings'

export { useReportsStore } from './reports'
export type { ReportType, DateRange, ProjectReport, BudgetSummary, TeamPerformance } from './reports'
