<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore, type ProjectStatus, type ProjectPriority } from '@/stores'
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PageHeader from '@/components/shared/PageHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'

const router = useRouter()
const projectsStore = useProjectsStore()

const searchQuery = ref('')
const statusFilter = ref<ProjectStatus | 'all'>('all')
const priorityFilter = ref<ProjectPriority | 'all'>('all')

const filteredProjects = computed(() => {
  let projects = projectsStore.projects

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    projects = projects.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.projectManager.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    projects = projects.filter(p => p.status === statusFilter.value)
  }

  // Priority filter
  if (priorityFilter.value !== 'all') {
    projects = projects.filter(p => p.priority === priorityFilter.value)
  }

  return projects
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewProject = (id: string) => {
  router.push(`/projects/${id}`)
}

const editProject = (id: string) => {
  router.push(`/projects/${id}/edit`)
}

const deleteProject = async (id: string) => {
  if (confirm('Are you sure you want to delete this project?')) {
    await projectsStore.deleteProject(id)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
}

onMounted(() => {
  projectsStore.fetchProjects()
})
</script>

<template>
  <div>
    <PageHeader
      title="Projects"
      description="Manage and track all your projects"
    >
      <template #actions>
        <Button @click="router.push('/projects/create')">
          <Plus class="h-4 w-4 mr-2" />
          New Project
        </Button>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div class="flex-1 max-w-md">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search projects..."
            class="pl-9"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Select v-model="statusFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="priorityFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          v-if="searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'"
          variant="outline"
          @click="clearFilters"
        >
          Clear
        </Button>
      </div>
    </div>

    <!-- Projects Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead class="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow 
            v-if="filteredProjects.length === 0"
            class="hover:bg-transparent"
          >
            <TableCell colspan="8" class="h-24 text-center text-muted-foreground">
              No projects found
            </TableCell>
          </TableRow>
          <TableRow 
            v-for="project in filteredProjects" 
            :key="project.id"
            class="cursor-pointer"
            @click="viewProject(project.id)"
          >
            <TableCell>
              <div>
                <div class="font-medium">{{ project.title }}</div>
                <div class="text-sm text-muted-foreground line-clamp-1">
                  {{ project.description }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge :status="project.status" size="sm" />
            </TableCell>
            <TableCell>
              <PriorityBadge :priority="project.priority" size="sm" />
            </TableCell>
            <TableCell class="text-sm">{{ project.projectManager }}</TableCell>
            <TableCell class="text-sm">{{ formatCurrency(project.budget) }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-primary transition-all"
                    :style="{ width: `${project.progress}%` }"
                  />
                </div>
                <span class="text-sm text-muted-foreground w-10">{{ project.progress }}%</span>
              </div>
            </TableCell>
            <TableCell class="text-sm">{{ formatDate(project.endDate) }}</TableCell>
            <TableCell @click.stop>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewProject(project.id)">
                    <Eye class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editProject(project.id)">
                    <Edit class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    @click="deleteProject(project.id)"
                    class="text-destructive"
                  >
                    <Trash2 class="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Stats Footer -->
    <div class="mt-4 text-sm text-muted-foreground">
      Showing {{ filteredProjects.length }} of {{ projectsStore.projects.length }} projects
    </div>
  </div>
</template>