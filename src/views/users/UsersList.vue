<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore, type UserRole, type UserStatus, type UserProfile } from '@/stores'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Mail, Phone } from 'lucide-vue-next'
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
import { Label } from '@/components/ui/label'
import PageHeader from '@/components/shared/PageHeader.vue'

const usersStore = useUsersStore()

const searchQuery = ref('')
const roleFilter = ref<UserRole | 'all'>('all')
const statusFilter = ref<UserStatus | 'all'>('all')

const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedUserId = ref<string | null>(null)
const showDeleteDialog = ref(false)
const userToDelete = ref<UserProfile | null>(null)

const formData = ref({
  email: '',
  username: '',
  password: '',
  fullName: '',
  role: 'staff' as UserRole,
  department: '',
  position: '',
  status: 'active' as UserStatus,
  phone: ''
})

const filteredUsers = computed(() => {
  let users = usersStore.users

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(u => 
      u.fullName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.department.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (roleFilter.value !== 'all') {
    users = users.filter(u => u.role === roleFilter.value)
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    users = users.filter(u => u.status === statusFilter.value)
  }

  return users
})

const getRoleBadgeClass = (role: UserRole) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    project_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    staff: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
  return classes[role]
}

const getStatusBadgeClass = (status: UserStatus) => {
  const classes = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  }
  return classes[status]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  selectedUserId.value = null
  formData.value = {
    email: '',
    username: '',
    password: '',
    fullName: '',
    role: 'staff',
    department: '',
    position: '',
    status: 'active',
    phone: ''
  }
  showDialog.value = true
}

const openEditDialog = (userId: string) => {
  const user = usersStore.users.find(u => u.id === userId)
  if (user) {
    dialogMode.value = 'edit'
    selectedUserId.value = userId
    formData.value = {
      email: user.email,
      username: user.username,
      password: '',
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      position: user.position,
      status: user.status,
      phone: user.phone || ''
    }
    showDialog.value = true
  }
}

const handleSubmit = async () => {
  if (dialogMode.value === 'create') {
    await usersStore.createUser(formData.value)
  } else if (selectedUserId.value) {
    await usersStore.updateUser(selectedUserId.value, formData.value)
  }
  showDialog.value = false
}

const openDeleteDialog = (user: UserProfile) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (userToDelete.value) {
    await usersStore.deleteUser(userToDelete.value.id)
    showDeleteDialog.value = false
    userToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  userToDelete.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  roleFilter.value = 'all'
  statusFilter.value = 'all'
}

onMounted(() => {
  usersStore.fetchUsers()
})
</script>

<template>
  <div>
    <PageHeader
      title="Users"
      description="Manage team members and permissions"
    >
      <template #actions>
        <Button @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          Add User
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
            placeholder="Search users..."
            class="pl-9"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Select v-model="roleFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="project_manager">Project Manager</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="statusFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          v-if="searchQuery || roleFilter !== 'all' || statusFilter !== 'all'"
          variant="outline"
          @click="clearFilters"
        >
          Clear
        </Button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead class="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow 
            v-if="filteredUsers.length === 0"
            class="hover:bg-transparent"
          >
            <TableCell colspan="6" class="h-24 text-center text-muted-foreground">
              No users found
            </TableCell>
          </TableRow>
          <TableRow v-for="user in filteredUsers" :key="user.id">
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                  {{ user.fullName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-medium">{{ user.fullName }}</div>
                  <div class="flex items-center gap-3 text-sm text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <Mail class="h-3 w-3" />
                      {{ user.email }}
                    </span>
                    <span v-if="user.phone" class="flex items-center gap-1">
                      <Phone class="h-3 w-3" />
                      {{ user.phone }}
                    </span>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span 
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                  getRoleBadgeClass(user.role)
                ]"
              >
                {{ user.role.replace('_', ' ') }}
              </span>
            </TableCell>
            <TableCell>
              <div>
                <div class="font-medium text-sm">{{ user.department }}</div>
                <div class="text-sm text-muted-foreground">{{ user.position }}</div>
              </div>
            </TableCell>
            <TableCell>
              <span 
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                  getStatusBadgeClass(user.status)
                ]"
              >
                {{ user.status }}
              </span>
            </TableCell>
            <TableCell class="text-sm">{{ formatDate(user.joinedAt) }}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openEditDialog(user.id)">
                    <Edit class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @click="openDeleteDialog(user)"
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
      Showing {{ filteredUsers.length }} of {{ usersStore.users.length }} users
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ dialogMode === 'create' ? 'Add New User' : 'Edit User' }}</DialogTitle>
          <DialogDescription>
            {{ dialogMode === 'create' ? 'Create a new user account' : 'Update user information' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <Label for="fullName">Full Name *</Label>
              <Input
                id="fullName"
                v-model="formData.fullName"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div class="grid gap-2">
              <Label for="email">Email *</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="juan@dost.gov.ph"
                required
              />
            </div>

            <div class="grid gap-2">
              <Label for="username">Username *</Label>
              <Input
                id="username"
                v-model="formData.username"
                placeholder="jdelacruz"
                required
              />
            </div>

            <div class="grid gap-2">
              <Label for="password">Password {{ dialogMode === 'create' ? '*' : '(leave blank to keep current)' }}</Label>
              <Input
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="••••••••"
                :required="dialogMode === 'create'"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="role">Role</Label>
                <Select v-model="formData.role">
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="grid gap-2">
                <Label for="status">Status</Label>
                <Select v-model="formData.status">
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="department">Department *</Label>
              <Input
                id="department"
                v-model="formData.department"
                placeholder="IT Department"
                required
              />
            </div>

            <div class="grid gap-2">
              <Label for="position">Position *</Label>
              <Input
                id="position"
                v-model="formData.position"
                placeholder="Software Developer"
                required
              />
            </div>

            <div class="grid gap-2">
              <Label for="phone">Phone</Label>
              <Input
                id="phone"
                v-model="formData.phone"
                type="tel"
                placeholder="+63 912 345 6789"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showDialog = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="usersStore.isLoading">
              {{ usersStore.isLoading ? 'Saving...' : dialogMode === 'create' ? 'Create User' : 'Save Changes' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ userToDelete?.fullName }}"? This action cannot be undone.
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