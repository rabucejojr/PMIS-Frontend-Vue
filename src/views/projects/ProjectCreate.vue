<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore, type ProjectStatus, type ProjectPriority } from '@/stores'
import { ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/shared/PageHeader.vue'

const router = useRouter()
const projectsStore = useProjectsStore()

const formData = ref({
  title: '',
  description: '',
  status: 'draft' as ProjectStatus,
  priority: 'medium' as ProjectPriority,
  startDate: '',
  endDate: '',
  budget: 0,
  spent: 0,
  progress: 0,
  projectManager: '',
  department: '',
  teamMembers: [] as string[]
})

const teamMemberInput = ref('')

const addTeamMember = () => {
  if (teamMemberInput.value.trim()) {
    formData.value.teamMembers.push(teamMemberInput.value.trim())
    teamMemberInput.value = ''
  }
}

const removeTeamMember = (index: number) => {
  formData.value.teamMembers.splice(index, 1)
}

const handleSubmit = async () => {
  const result = await projectsStore.createProject(formData.value)
  
  if (result.success) {
    router.push('/projects')
  } else {
    alert(result.error || 'Failed to create project')
  }
}

const cancel = () => {
  router.push('/projects')
}
</script>

<template>
  <div>
    <PageHeader
      title="Create New Project"
      description="Add a new project to your portfolio"
      :breadcrumbs="[
        { label: 'Projects', to: '/projects' },
        { label: 'Create' }
      ]"
    >
      <template #actions>
        <Button variant="outline" @click="cancel">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back
        </Button>
      </template>
    </PageHeader>

    <form @submit.prevent="handleSubmit" class="max-w-4xl">
      <div class="grid gap-6">
        <!-- Basic Information -->
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4">
            <div class="grid gap-2">
              <Label for="title">Project Title *</Label>
              <Input
                id="title"
                v-model="formData.title"
                placeholder="Enter project title"
                required
              />
            </div>

            <div class="grid gap-2">
              <Label for="description">Description *</Label>
              <Textarea
                id="description"
                v-model="formData.description"
                placeholder="Enter project description"
                rows="4"
                required
              />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2">
                <Label for="status">Status</Label>
                <Select v-model="formData.status">
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
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
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Timeline & Budget -->
        <Card>
          <CardHeader>
            <CardTitle>Timeline & Budget</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2">
                <Label for="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  v-model="formData.startDate"
                  type="date"
                  required
                />
              </div>

              <div class="grid gap-2">
                <Label for="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  v-model="formData.endDate"
                  type="date"
                  required
                />
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2">
                <Label for="budget">Budget (PHP) *</Label>
                <Input
                  id="budget"
                  v-model.number="formData.budget"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0.00"
                  required
                />
              </div>

              <div class="grid gap-2">
                <Label for="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  v-model.number="formData.progress"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Team Information -->
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2">
                <Label for="projectManager">Project Manager *</Label>
                <Input
                  id="projectManager"
                  v-model="formData.projectManager"
                  placeholder="Enter manager name"
                  required
                />
              </div>

              <div class="grid gap-2">
                <Label for="department">Department *</Label>
                <Input
                  id="department"
                  v-model="formData.department"
                  placeholder="Enter department"
                  required
                />
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="teamMembers">Team Members</Label>
              <div class="flex gap-2">
                <Input
                  id="teamMembers"
                  v-model="teamMemberInput"
                  placeholder="Enter team member name"
                  @keyup.enter="addTeamMember"
                />
                <Button type="button" @click="addTeamMember">Add</Button>
              </div>
              <div v-if="formData.teamMembers.length" class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="(member, index) in formData.teamMembers"
                  :key="index"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {{ member }}
                  <button
                    type="button"
                    @click="removeTeamMember(index)"
                    class="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Actions -->
        <div class="flex gap-2 justify-end">
          <Button type="button" variant="outline" @click="cancel">
            Cancel
          </Button>
          <Button type="submit" :disabled="projectsStore.isLoading">
            {{ projectsStore.isLoading ? 'Creating...' : 'Create Project' }}
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>