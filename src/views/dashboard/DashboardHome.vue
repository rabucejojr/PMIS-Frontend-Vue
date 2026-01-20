<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useProjectsStore, useTasksStore, useUsersStore } from '@/stores'
import { 
  FolderKanban, 
  CheckSquare, 
  Users, 
  TrendingUp,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'

const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()

const stats = computed(() => [
  {
    title: 'Active Projects',
    value: projectsStore.activeProjects.length,
    total: projectsStore.projects.length,
    icon: FolderKanban,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    change: '+12%'
  },
  {
    title: 'Pending Tasks',
    value: tasksStore.tasksByStatus['todo'].length + tasksStore.tasksByStatus['in-progress'].length,
    total: tasksStore.tasks.length,
    icon: CheckSquare,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    change: '-5%'
  },
  {
    title: 'Team Members',
    value: usersStore.users.filter(u => u.status === 'active').length,
    total: usersStore.users.length,
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900',
    change: '+2'
  },
  {
    title: 'Completion Rate',
    value: projectsStore.projects.length > 0 
      ? Math.round((projectsStore.completedProjects.length / projectsStore.projects.length) * 100)
      : 0,
    suffix: '%',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    change: '+8%'
  }
])

const recentProjects = computed(() => {
  return projectsStore.projects
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
})

const upcomingDeadlines = computed(() => {
  const now = new Date()
  const upcoming = projectsStore.projects
    .filter(p => {
      const endDate = new Date(p.endDate)
      const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return p.status === 'active' && daysUntil <= 30 && daysUntil >= 0
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5)
  
  return upcoming
})

const projectsByStatus = computed(() => {
  return [
    { status: 'active', count: projectsStore.projectsByStatus.active.length, color: 'bg-green-500' },
    { status: 'on-hold', count: projectsStore.projectsByStatus['on-hold'].length, color: 'bg-yellow-500' },
    { status: 'completed', count: projectsStore.projectsByStatus.completed.length, color: 'bg-blue-500' },
    { status: 'draft', count: projectsStore.projectsByStatus.draft.length, color: 'bg-gray-500' }
  ]
})

const totalProjects = computed(() => projectsStore.projects.length)

const budgetStats = computed(() => {
  const total = projectsStore.totalBudget
  const spent = projectsStore.totalSpent
  const percentage = total > 0 ? (spent / total) * 100 : 0
  
  return {
    total,
    spent,
    remaining: total - spent,
    percentage
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getDaysUntil = (date: string) => {
  const now = new Date()
  const end = new Date(date)
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return days
}

onMounted(() => {
  projectsStore.fetchProjects()
  tasksStore.fetchTasks()
  usersStore.fetchUsers()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <p class="text-muted-foreground mt-1">
        Welcome back, {{ authStore.user?.username }}!
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card v-for="stat in stats" :key="stat.title">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">{{ stat.title }}</p>
              <div class="flex items-baseline gap-2 mt-2">
                <p class="text-3xl font-bold">
                  {{ stat.value }}{{ stat.suffix || '' }}
                </p>
                <span v-if="stat.total" class="text-sm text-muted-foreground">
                  / {{ stat.total }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                <span :class="stat.change?.startsWith('+') ? 'text-green-600' : 'text-red-600'">
                  {{ stat.change }}
                </span>
                from last month
              </p>
            </div>
            <div :class="['rounded-lg p-3', stat.bgColor]">
              <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 md:grid-cols-2 mb-6">
      <!-- Project Status Distribution -->
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="item in projectsByStatus" :key="item.status" class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="capitalize text-muted-foreground">{{ item.status.replace('-', ' ') }}</span>
                <span class="font-medium">{{ item.count }} / {{ totalProjects }}</span>
              </div>
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  :class="[item.color, 'h-full transition-all']"
                  :style="{ width: `${totalProjects > 0 ? (item.count / totalProjects) * 100 : 0}%` }"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Budget Overview -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <DollarSign class="h-5 w-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-muted-foreground">Total Budget</span>
                <span class="font-medium">{{ formatCurrency(budgetStats.total) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-muted-foreground">Spent</span>
                <span class="font-medium">{{ formatCurrency(budgetStats.spent) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm mb-3">
                <span class="text-muted-foreground">Remaining</span>
                <span class="font-medium">{{ formatCurrency(budgetStats.remaining) }}</span>
              </div>
              <Progress :model-value="budgetStats.percentage" class="h-2" />
              <p class="text-xs text-muted-foreground mt-2 text-center">
                {{ budgetStats.percentage.toFixed(1) }}% of budget utilized
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Recent Projects -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" @click="router.push('/projects')">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="recentProjects.length === 0" class="text-center py-6 text-muted-foreground">
            No projects yet
          </div>
          <div v-else class="space-y-4">
            <div 
              v-for="project in recentProjects" 
              :key="project.id"
              class="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              @click="router.push(`/projects/${project.id}`)"
            >
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ project.title }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <StatusBadge :status="project.status" size="sm" />
                  <PriorityBadge :priority="project.priority" size="sm" :show-icon="false" />
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{{ project.progress }}%</div>
                <Progress :model-value="project.progress" class="h-1 w-16 mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Upcoming Deadlines -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Clock class="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="upcomingDeadlines.length === 0" class="text-center py-6 text-muted-foreground">
            No upcoming deadlines
          </div>
          <div v-else class="space-y-4">
            <div 
              v-for="project in upcomingDeadlines" 
              :key="project.id"
              class="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              @click="router.push(`/projects/${project.id}`)"
            >
              <div class="rounded-lg bg-orange-100 dark:bg-orange-900 p-2 mt-0.5">
                <AlertCircle class="h-4 w-4 text-orange-600" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ project.title }}</div>
                <div class="text-sm text-muted-foreground mt-1">
                  Due {{ formatDate(project.endDate) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">
                  {{ getDaysUntil(project.endDate) }} days
                </div>
                <Progress :model-value="project.progress" class="h-1 w-16 mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>