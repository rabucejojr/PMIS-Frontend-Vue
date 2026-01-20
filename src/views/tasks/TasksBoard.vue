<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTasksStore, useProjectsStore, type TaskStatus } from '@/stores'
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import PriorityBadge from '@/components/shared/PriorityBadge.vue'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedTaskId = ref<string | null>(null)
const draggedTask = ref<string | null>(null)

const formData = ref({
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as any,
  projectId: '',
  assignedTo: [] as string[],
  dueDate: '',
  tags: [] as string[]
})

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-t-gray-500' },
  { id: 'in-progress', title: 'In Progress', color: 'border-t-blue-500' },
  { id: 'review', title: 'Review', color: 'border-t-orange-500' },
  { id: 'done', title: 'Done', color: 'border-t-green-500' }
]

const getColumnTasks = (status: TaskStatus) => {
  return tasksStore.tasksByStatus[status] || []
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const isOverdue = (dueDate: string, status: TaskStatus) => {
  if (status === 'done') return false
  return new Date(dueDate) < new Date()
}

const openCreateDialog = (status: TaskStatus) => {
  dialogMode.value = 'create'
  selectedTaskId.value = null
  formData.value = {
    title: '',
    description: '',
    status,
    priority: 'medium',
    projectId: projectsStore.projects[0]?.id || '',
    assignedTo: [],
    dueDate: '',
    tags: []
  }
  showDialog.value = true
}

const openEditDialog = (taskId: string) => {
  const task = tasksStore.tasks.find(t => t.id === taskId)
  if (task) {
    dialogMode.value = 'edit'
    selectedTaskId.value = taskId
    formData.value = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assignedTo: [...task.assignedTo],
      dueDate: task.dueDate,
      tags: [...task.tags]
    }
    showDialog.value = true
  }
}

const handleSubmit = async () => {
  const taskData = {
    ...formData.value,
    createdBy: 'Admin'
  }

  if (dialogMode.value === 'create') {
    await tasksStore.createTask(taskData)
  } else if (selectedTaskId.value) {
    await tasksStore.updateTask(selectedTaskId.value, taskData)
  }
  showDialog.value = false
}

const deleteTask = async (id: string) => {
  if (confirm('Are you sure you want to delete this task?')) {
    await tasksStore.deleteTask(id)
  }
}

// Drag and Drop handlers
const handleDragStart = (taskId: string) => {
  draggedTask.value = taskId
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = async (status: TaskStatus) => {
  if (draggedTask.value) {
    await tasksStore.updateTaskStatus(draggedTask.value, status)
    draggedTask.value = null
  }
}

onMounted(() => {
  tasksStore.fetchTasks()
  projectsStore.fetchProjects()
})
</script>

<template>
  <div>
    <PageHeader
      title="Tasks Board"
      description="Track and manage your tasks"
    />

    <!-- Kanban Board -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="column in columns" 
        :key="column.id"
        class="flex flex-col"
        @dragover="handleDragOver"
        @drop="handleDrop(column.id as TaskStatus)"
      >
        <Card :class="['border-t-4', column.color]">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-sm font-medium">
                {{ column.title }}
                <span class="ml-2 text-muted-foreground">
                  ({{ getColumnTasks(column.id as TaskStatus).length }})
                </span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                class="h-7 w-7"
                @click="openCreateDialog(column.id as TaskStatus)"
              >
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent class="space-y-3 min-h-[500px]">
            <!-- Task Cards -->
            <div
              v-for="task in getColumnTasks(column.id as TaskStatus)"
              :key="task.id"
              draggable="true"
              @dragstart="handleDragStart(task.id)"
              class="p-3 bg-card border rounded-lg cursor-move hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <h4 class="font-medium text-sm line-clamp-2">{{ task.title }}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-6 w-6">
                      <MoreHorizontal class="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openEditDialog(task.id)">
                      <Edit class="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      @click="deleteTask(task.id)"
                      class="text-destructive"
                    >
                      <Trash2 class="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p v-if="task.description" class="text-xs text-muted-foreground line-clamp-2 mb-2">
                {{ task.description }}
              </p>

              <div class="flex items-center gap-2 mb-2">
                <PriorityBadge :priority="task.priority" size="sm" />
              </div>

              <div v-if="task.tags.length" class="flex flex-wrap gap-1 mb-2">
                <span
                  v-for="tag in task.tags"
                  :key="tag"
                  class="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <div class="flex items-center gap-1">
                  <Calendar class="h-3 w-3" />
                  <span :class="{ 'text-red-600': isOverdue(task.dueDate, task.status) }">
                    {{ formatDate(task.dueDate) }}
                  </span>
                </div>
                <div v-if="task.assignedTo.length" class="flex items-center gap-1">
                  <User class="h-3 w-3" />
                  <span>{{ task.assignedTo.length }}</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div 
              v-if="getColumnTasks(column.id as TaskStatus).length === 0"
              class="text-center py-8 text-muted-foreground text-sm"
            >
              No tasks
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ dialogMode === 'create' ? 'Create Task' : 'Edit Task' }}</DialogTitle>
          <DialogDescription>
            {{ dialogMode === 'create' ? 'Add a new task to your board' : 'Update task information' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <Label for="title">Title *</Label>
              <Input
                id="title"
                v-model="formData.title"
                placeholder="Task title"
                required
              />
            </div>

            <div class="grid gap-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="formData.description"
                placeholder="Task description"
                rows="3"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="status">Status</Label>
                <Select v-model="formData.status">
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="grid gap-2">
                <Label for="priority">Priority</Label>
                <Select v-model="formData.priority">
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="project">Project *</Label>
              <Select v-model="formData.projectId">
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="project in projectsStore.projects" 
                    :key="project.id"
                    :value="project.id"
                  >
                    {{ project.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="grid gap-2">
              <Label for="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                v-model="formData.dueDate"
                type="date"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showDialog = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="tasksStore.isLoading">
              {{ tasksStore.isLoading ? 'Saving...' : dialogMode === 'create' ? 'Create Task' : 'Save Changes' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>