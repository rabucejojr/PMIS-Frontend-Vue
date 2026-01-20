<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDocumentsStore, useProjectsStore, type DocumentCategory } from '@/stores'
import { 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  File,
  MoreHorizontal,
  Filter
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

const documentsStore = useDocumentsStore()
const projectsStore = useProjectsStore()

const searchQuery = ref('')
const categoryFilter = ref<DocumentCategory | 'all'>('all')
const projectFilter = ref<string>('all')
const showUploadDialog = ref(false)

const uploadForm = ref({
  name: '',
  category: 'other' as DocumentCategory,
  projectId: '',
  description: '',
  file: null as File | null
})

const fileInput = ref<HTMLInputElement | null>(null)

const filteredDocuments = computed(() => {
  let docs = documentsStore.documents

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    docs = docs.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.projectName.toLowerCase().includes(query) ||
      d.uploadedBy.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (categoryFilter.value !== 'all') {
    docs = docs.filter(d => d.category === categoryFilter.value)
  }

  // Project filter
  if (projectFilter.value !== 'all') {
    docs = docs.filter(d => d.projectId === projectFilter.value)
  }

  return docs
})

const getCategoryBadgeClass = (category: DocumentCategory) => {
  const classes = {
    proposal: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    report: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    budget: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    contract: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
  return classes[category]
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return FileText
  if (type.includes('word') || type.includes('document')) return FileText
  if (type.includes('sheet') || type.includes('excel')) return File
  return File
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openUploadDialog = () => {
  uploadForm.value = {
    name: '',
    category: 'other',
    projectId: projectsStore.projects[0]?.id || '',
    description: '',
    file: null
  }
  showUploadDialog.value = true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0]
    if (!uploadForm.value.name) {
      uploadForm.value.name = target.files[0].name
    }
  }
}

const handleUpload = async () => {
  if (!uploadForm.value.file || !uploadForm.value.projectId) {
    alert('Please select a file and project')
    return
  }

  const project = projectsStore.projects.find(p => p.id === uploadForm.value.projectId)
  
  const documentData = {
    name: uploadForm.value.name || uploadForm.value.file.name,
    category: uploadForm.value.category,
    projectId: uploadForm.value.projectId,
    projectName: project?.title || '',
    size: uploadForm.value.file.size,
    type: uploadForm.value.file.type,
    uploadedBy: 'Current User', // TODO: Get from auth store
    description: uploadForm.value.description
  }

  const result = await documentsStore.uploadDocument(documentData)
  
  if (result.success) {
    showUploadDialog.value = false
  } else {
    alert(result.error || 'Failed to upload document')
  }
}

const downloadDocument = async (id: string) => {
  await documentsStore.downloadDocument(id)
}

const deleteDocument = async (id: string) => {
  if (confirm('Are you sure you want to delete this document?')) {
    await documentsStore.deleteDocument(id)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = 'all'
  projectFilter.value = 'all'
}

onMounted(() => {
  documentsStore.fetchDocuments()
  projectsStore.fetchProjects()
})
</script>

<template>
  <div>
    <PageHeader
      title="Documents"
      description="Manage project documents and files"
    >
      <template #actions>
        <Button @click="openUploadDialog">
          <Upload class="h-4 w-4 mr-2" />
          Upload Document
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
            placeholder="Search documents..."
            class="pl-9"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Select v-model="categoryFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="projectFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem 
              v-for="project in projectsStore.projects" 
              :key="project.id"
              :value="project.id"
            >
              {{ project.title }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button 
          v-if="searchQuery || categoryFilter !== 'all' || projectFilter !== 'all'"
          variant="outline"
          @click="clearFilters"
        >
          Clear
        </Button>
      </div>
    </div>

    <!-- Documents Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Uploaded At</TableHead>
            <TableHead class="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow 
            v-if="filteredDocuments.length === 0"
            class="hover:bg-transparent"
          >
            <TableCell colspan="7" class="h-24 text-center text-muted-foreground">
              No documents found
            </TableCell>
          </TableRow>
          <TableRow v-for="doc in filteredDocuments" :key="doc.id">
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-muted p-2">
                  <component :is="getFileIcon(doc.type)" class="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div class="font-medium">{{ doc.name }}</div>
                  <div v-if="doc.description" class="text-sm text-muted-foreground line-clamp-1">
                    {{ doc.description }}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span 
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                  getCategoryBadgeClass(doc.category)
                ]"
              >
                {{ doc.category }}
              </span>
            </TableCell>
            <TableCell class="text-sm">{{ doc.projectName }}</TableCell>
            <TableCell class="text-sm">{{ formatFileSize(doc.size) }}</TableCell>
            <TableCell class="text-sm">{{ doc.uploadedBy }}</TableCell>
            <TableCell class="text-sm">{{ formatDate(doc.uploadedAt) }}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="downloadDocument(doc.id)">
                    <Download class="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    @click="deleteDocument(doc.id)"
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
      Showing {{ filteredDocuments.length }} of {{ documentsStore.documents.length }} documents
    </div>

    <!-- Upload Dialog -->
    <Dialog v-model:open="showUploadDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document to your project
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleUpload">
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <Label for="file">File *</Label>
              <Input
                id="file"
                ref="fileInput"
                type="file"
                @change="handleFileSelect"
                required
              />
            </div>

            <div class="grid gap-2">
              <Label for="name">Document Name *</Label>
              <Input
                id="name"
                v-model="uploadForm.name"
                placeholder="Enter document name"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="category">Category</Label>
                <Select v-model="uploadForm.category">
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="grid gap-2">
                <Label for="project">Project *</Label>
                <Select v-model="uploadForm.projectId">
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
            </div>

            <div class="grid gap-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="uploadForm.description"
                placeholder="Optional description"
                rows="3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showUploadDialog = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="documentsStore.isLoading">
              {{ documentsStore.isLoading ? 'Uploading...' : 'Upload' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>