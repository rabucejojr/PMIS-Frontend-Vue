<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Building2,
  TrendingUp
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PageHeader from '@/components/shared/PageHeader.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()

const projectId = route.params.id as string
const showDeleteDialog = ref(false)

const project = computed(() => projectsStore.currentProject)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const budgetUsed = computed(() => {
  if (!project.value) return 0
  return (project.value.spent / project.value.budget) * 100
})

const handleEdit = () => {
  router.push(`/projects/${projectId}/edit`)
}

const openDeleteDialog = () => {
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  const result = await projectsStore.deleteProject(projectId)
  if (result.success) {
    router.push('/projects')
  }
  showDeleteDialog.value = false
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

onMounted(() => {
  projectsStore.fetchProjectById(projectId)
})
</script>

<template>
  <div>
    <PageHeader
      :title="project?.title || 'Project Details'"
      :breadcrumbs="[
        { label: 'Projects', to: '/projects' },
        { label: project?.title || 'Details' }
      ]"
    >
      <template #actions>
        <Button variant="outline" @click="router.push('/projects')">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="outline" @click="handleEdit">
          <Edit class="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" @click="openDeleteDialog">
          <Trash2 class="h-4 w-4 mr-2" />
          Delete
        </Button>
      </template>
    </PageHeader>

    <div v-if="projectsStore.isLoading" class="text-center py-12">
      <p class="text-muted-foreground">Loading project...</p>
    </div>

    <div v-else-if="!project" class="text-center py-12">
      <p class="text-muted-foreground">Project not found</p>
    </div>

    <div v-else class="grid gap-6">
      <!-- Project Overview -->
      <Card>
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <CardTitle>{{ project.title }}</CardTitle>
              <p class="text-sm text-muted-foreground">{{ project.description }}</p>
            </div>
            <div class="flex gap-2">
              <StatusBadge :status="project.status" />
              <PriorityBadge :priority="project.priority" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2">
                <Calendar class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Timeline</p>
                <p class="font-medium">{{ formatDate(project.startDate) }}</p>
                <p class="text-sm">to {{ formatDate(project.endDate) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2">
                <DollarSign class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Budget</p>
                <p class="font-medium">{{ formatCurrency(project.budget) }}</p>
                <p class="text-sm text-muted-foreground">{{ formatCurrency(project.spent) }} spent</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2">
                <Users class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Project Manager</p>
                <p class="font-medium">{{ project.projectManager }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="rounded-lg bg-primary/10 p-2">
                <Building2 class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Department</p>
                <p class="font-medium">{{ project.department }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Progress & Budget -->
      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <TrendingUp class="h-5 w-5" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Overall Progress</span>
                <span class="font-medium">{{ project.progress }}%</span>
              </div>
              <Progress :model-value="project.progress" class="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <DollarSign class="h-5 w-5" />
              Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Used</span>
                <span class="font-medium">{{ budgetUsed.toFixed(1) }}%</span>
              </div>
              <Progress :model-value="budgetUsed" class="h-2" />
              <div class="flex justify-between text-sm text-muted-foreground">
                <span>{{ formatCurrency(project.spent) }}</span>
                <span>{{ formatCurrency(project.budget) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Team Members -->
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="project.teamMembers.length === 0" class="text-center py-6 text-muted-foreground">
            No team members assigned
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <div
              v-for="(member, index) in project.teamMembers"
              :key="index"
              class="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {{ member.charAt(0).toUpperCase() }}
              </div>
              <span class="font-medium">{{ member }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Project Metadata -->
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl class="grid gap-4 md:grid-cols-2">
            <div>
              <dt class="text-sm text-muted-foreground">Created At</dt>
              <dd class="font-medium">{{ formatDate(project.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted-foreground">Last Updated</dt>
              <dd class="font-medium">{{ formatDate(project.updatedAt) }}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ project?.title }}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="cancelDelete">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>