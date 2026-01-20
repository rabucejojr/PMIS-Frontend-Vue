<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare,
  ClipboardCheck,
  Users, 
  FileText,
  Settings,
  LogOut
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const route = useRoute()
const authStore = useAuthStore()

interface NavItem {
  label: string
  icon: any
  path: string
  roles?: string[]
}

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Projects', icon: FolderKanban, path: '/projects' },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { label: 'Documents', icon: FileText, path: '/documents' },
    { label: 'Reports', icon: ClipboardCheck, path: '/reports' },
  ]

  // Add admin-only items
  if (authStore.isAdmin) {
    items.push({ label: 'Users', icon: Users, path: '/users', roles: ['admin'] })
    items.push({ label: 'Settings', icon: Settings, path: '/settings', roles: ['admin'] })
  }

  return items
})

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <aside class="flex h-screen w-64 flex-col">
    <!-- Logo/Brand -->
    <div class="flex h-16 items-center gap-3 border-b px-6">
      <div class="flex h-10 w-10 items-center justify-center">
        <img src="/dost-logo.png" alt="Logo" class="h-8 w-8" />
      </div>
      <div class="flex flex-col">
        <h1 class="text-lg font-bold leading-none">DOST PMIS</h1>
        <p class="text-xs text-muted-foreground">Surigao del Norte</p>
      </div>
    </div>


    <!-- Navigation -->
    <nav class="flex-1 space-y-1 px-3 py-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        :class="{
          'bg-accent text-accent-foreground': isActive(item.path),
          'text-muted-foreground': !isActive(item.path),
        }"
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- User Section -->
    <div class="border-t p-4">
      <div class="flex items-center gap-3 rounded-lg px-3 py-2 mb-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {{ authStore.user?.username?.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ authStore.user?.username }}</p>
          <p class="text-xs text-muted-foreground truncate">{{ authStore.user?.role }}</p>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        class="w-full justify-start gap-3"
        @click="handleLogout"
      >
        <LogOut class="h-5 w-5" />
        Logout
      </Button>
    </div>
  </aside>
</template>