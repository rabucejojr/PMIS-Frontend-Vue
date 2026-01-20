<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useReportsStore, useProjectsStore, useTasksStore, useUsersStore } from '@/stores'
import { 
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FolderKanban,
  CheckSquare,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import PageHeader from '@/components/shared/PageHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const reportsStore = useReportsStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()

const selectedReport = ref<'overview' | 'projects' | 'budget' | 'team'>('overview')

const reportTabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'team', label: 'Team', icon: Users }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount)
}

const formatCurrencyFull = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const downloadReport = async () => {
  const result = await reportsStore.generateReport('project_summary')
  if (result.success) {
    alert('Report generated! In production, this would download a PDF/Excel file.')
  } else {
    alert('Failed to generate report')
  }
}

onMounted(() => {
  projectsStore.fetchProjects()
  tasksStore.fetchTasks()
  usersStore.fetchUsers()
})
</script>

<template>
  <div>
    <PageHeader
      title="Reports & Analytics"
      description="Comprehensive insights into your projects and team performance"
    >
      <template #actions>
        <Select v-model="reportsStore.selectedDateRange">
          <SelectTrigger class="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Button @click="downloadReport">
          <Download class="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </template>
    </PageHeader>

    <!-- Report Tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <Button
        v-for="tab in reportTabs"
        :key="tab.id"
        @click="selectedReport = tab.id as any"
        :variant="selectedReport === tab.id ? 'default' : 'outline'"
        class="flex items-center gap-2"
      >
        <component :is="tab.icon" class="h-4 w-4" />
        {{ tab.label }}
      </Button>
    </div>

    <!-- Overview Tab -->
    <div v-if="selectedReport === 'overview'" class="space-y-6">
      <!-- Key Metrics -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p class="text-3xl font-bold mt-2">{{ projectsStore.projects.length }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ reportsStore.projectsByStatus.active }} active
                </p>
              </div>
              <div class="rounded-lg bg-blue-100 dark:bg-blue-900 p-3">
                <FolderKanban class="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p class="text-3xl font-bold mt-2">{{ formatCurrency(reportsStore.budgetSummary.totalBudget) }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ reportsStore.budgetSummary.utilizationRate.toFixed(1) }}% utilized
                </p>
              </div>
              <div class="rounded-lg bg-green-100 dark:bg-green-900 p-3">
                <DollarSign class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p class="text-3xl font-bold mt-2">{{ reportsStore.taskStatistics.total }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ reportsStore.taskStatistics.completionRate }}% completed
                </p>
              </div>
              <div class="rounded-lg bg-orange-100 dark:bg-orange-900 p-3">
                <CheckSquare class="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Team Members</p>
                <p class="text-3xl font-bold mt-2">{{ reportsStore.teamPerformance.totalMembers }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ reportsStore.teamPerformance.activeMembers }} active
                </p>
              </div>
              <div class="rounded-lg bg-purple-100 dark:bg-purple-900 p-3">
                <Users class="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Charts Row -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Project Status Distribution -->
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current status of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-muted-foreground">Active</span>
                  <span class="font-medium">{{ reportsStore.projectsByStatus.active }}</span>
                </div>
                <Progress :model-value="(reportsStore.projectsByStatus.active / projectsStore.projects.length) * 100" class="h-2 bg-green-200">
                  <div class="bg-green-500 h-full" />
                </Progress>
              </div>
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-muted-foreground">On Hold</span>
                  <span class="font-medium">{{ reportsStore.projectsByStatus.onHold }}</span>
                </div>
                <Progress :model-value="(reportsStore.projectsByStatus.onHold / projectsStore.projects.length) * 100" class="h-2 bg-yellow-200">
                  <div class="bg-yellow-500 h-full" />
                </Progress>
              </div>
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-muted-foreground">Completed</span>
                  <span class="font-medium">{{ reportsStore.projectsByStatus.completed }}</span>
                </div>
                <Progress :model-value="(reportsStore.projectsByStatus.completed / projectsStore.projects.length) * 100" class="h-2 bg-blue-200">
                  <div class="bg-blue-500 h-full" />
                </Progress>
              </div>
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-muted-foreground">Draft</span>
                  <span class="font-medium">{{ reportsStore.projectsByStatus.draft }}</span>
                </div>
                <Progress :model-value="(reportsStore.projectsByStatus.draft / projectsStore.projects.length) * 100" class="h-2 bg-gray-200">
                  <div class="bg-gray-500 h-full" />
                </Progress>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Task Completion -->
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Status</CardTitle>
            <CardDescription>Task distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-muted-foreground">Completed</span>
                  <span class="font-medium">{{ reportsStore.taskStatistics.done }}</span>
                </div>
                <Progress :model-value="(reportsStore.taskStatistics.done / reportsStore.taskStatistics.total) * 100" class="h-2 bg-green-200">
                  <div class="bg-green-500 h-full" />
                </Progress>
              </div>
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-muted-foreground">In Progress</span>
                  <span class="font-medium">{{ reportsStore.taskStatistics.inProgress }}</span>
                </div>
                <Progress :model-value="(reportsStore.taskStatistics.inProgress / reportsStore.taskStatistics.total) * 100" class="h-2 bg-blue-200">
                  <div class="bg-blue-500 h-full" />
                </Progress>
              </div>
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-muted-foreground">In Review</span>
                  <span class="font-medium">{{ reportsStore.taskStatistics.review }}</span>
                </div>
                <Progress :model-value="(reportsStore.taskStatistics.review / reportsStore.taskStatistics.total) * 100" class="h-2 bg-orange-200">
                  <div class="bg-orange-500 h-full" />
                </Progress>
              </div>
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-muted-foreground">To Do</span>
                  <span class="font-medium">{{ reportsStore.taskStatistics.todo }}</span>
                </div>
                <Progress :model-value="(reportsStore.taskStatistics.todo / reportsStore.taskStatistics.total) * 100" class="h-2 bg-gray-200">
                  <div class="bg-gray-500 h-full" />
                </Progress>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Projects Tab -->
    <div v-if="selectedReport === 'projects'">
      <Card>
        <CardHeader>
          <CardTitle>Project Performance Report</CardTitle>
          <CardDescription>Detailed analysis of all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>On Track</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="report in reportsStore.projectReports" :key="report.projectId">
                  <TableCell class="font-medium">{{ report.projectName }}</TableCell>
                  <TableCell>
                    <StatusBadge :status="report.status as any" size="sm" />
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Progress :model-value="report.progress" class="h-2 w-24" />
                      <span class="text-sm">{{ report.progress }}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm">{{ report.tasksCompleted }} / {{ report.tasksTotal }}</span>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm">{{ report.teamSize }} members</span>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Calendar class="h-3 w-3 text-muted-foreground" />
                      <span class="text-sm">{{ report.daysRemaining }} days</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div v-if="report.isOnTrack" class="flex items-center gap-1 text-green-600">
                      <CheckCircle class="h-4 w-4" />
                      <span class="text-sm">Yes</span>
                    </div>
                    <div v-else class="flex items-center gap-1 text-orange-600">
                      <AlertCircle class="h-4 w-4" />
                      <span class="text-sm">Behind</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Budget Tab -->
    <div v-if="selectedReport === 'budget'" class="space-y-6">
      <div class="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent class="p-6">
            <p class="text-sm font-medium text-muted-foreground">Total Budget</p>
            <p class="text-2xl font-bold mt-2">{{ formatCurrencyFull(reportsStore.budgetSummary.totalBudget) }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-6">
            <p class="text-sm font-medium text-muted-foreground">Total Spent</p>
            <p class="text-2xl font-bold mt-2">{{ formatCurrencyFull(reportsStore.budgetSummary.totalSpent) }}</p>
            <div class="flex items-center gap-1 mt-1 text-orange-600">
              <TrendingUp class="h-3 w-3" />
              <span class="text-xs">{{ reportsStore.budgetSummary.utilizationRate.toFixed(1) }}% utilized</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-6">
            <p class="text-sm font-medium text-muted-foreground">Remaining</p>
            <p class="text-2xl font-bold mt-2">{{ formatCurrencyFull(reportsStore.budgetSummary.totalRemaining) }}</p>
            <div class="flex items-center gap-1 mt-1 text-green-600">
              <TrendingDown class="h-3 w-3" />
              <span class="text-xs">{{ (100 - reportsStore.budgetSummary.utilizationRate).toFixed(1) }}% available</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget by Project</CardTitle>
          <CardDescription>Budget allocation and spending per project</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="project in reportsStore.budgetSummary.projectsBudgets" :key="project.projectName" class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium">{{ project.projectName }}</span>
                <span class="text-muted-foreground">
                  {{ formatCurrencyFull(project.spent) }} / {{ formatCurrencyFull(project.budget) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Progress :model-value="project.percentage" class="flex-1 h-2" />
                <span class="text-sm font-medium w-12 text-right">{{ project.percentage.toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Team Tab -->
    <div v-if="selectedReport === 'team'" class="space-y-6">
      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent class="p-6">
            <p class="text-sm font-medium text-muted-foreground">Total Members</p>
            <p class="text-2xl font-bold mt-2">{{ reportsStore.teamPerformance.totalMembers }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-6">
            <p class="text-sm font-medium text-muted-foreground">Active Members</p>
            <p class="text-2xl font-bold mt-2">{{ reportsStore.teamPerformance.activeMembers }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-6">
            <p class="text-sm font-medium text-muted-foreground">Tasks per Member</p>
            <p class="text-2xl font-bold mt-2">{{ reportsStore.teamPerformance.tasksPerMember }}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-6">
            <p class="text-sm font-medium text-muted-foreground">Completion Rate</p>
            <p class="text-2xl font-bold mt-2">{{ reportsStore.teamPerformance.completionRate }}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Team members with highest task completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div 
              v-for="(performer, index) in reportsStore.teamPerformance.topPerformers" 
              :key="performer.name"
              class="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                #{{ index + 1 }}
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ performer.name }}</div>
                <div class="text-sm text-muted-foreground">{{ performer.projects }} projects</div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold">{{ performer.tasksCompleted }}</div>
                <div class="text-xs text-muted-foreground">tasks completed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>