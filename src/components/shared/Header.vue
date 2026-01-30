<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Bell, Search, Sun, Moon } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores'

const settingsStore = useSettingsStore()

const searchQuery = ref('')
const hasNotifications = ref(true)
const currentDate = ref(new Date())
const systemPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

// Update date at midnight
let dateInterval: ReturnType<typeof setInterval>
onMounted(() => {
  // Update date every minute to catch midnight
  dateInterval = setInterval(() => {
    currentDate.value = new Date()
  }, 60000)

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e: MediaQueryListEvent) => {
    systemPrefersDark.value = e.matches
  }
  mediaQuery.addEventListener('change', handleChange)

  onUnmounted(() => {
    clearInterval(dateInterval)
    mediaQuery.removeEventListener('change', handleChange)
  })
})

const isDarkMode = computed(() => {
  if (settingsStore.theme === 'dark') return true
  if (settingsStore.theme === 'light') return false
  // System theme - use reactive ref
  return systemPrefersDark.value
})

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

const toggleTheme = () => {
  const newTheme = isDarkMode.value ? 'light' : 'dark'
  settingsStore.updateTheme(newTheme)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('Searching for:', searchQuery.value)
    // TODO: Implement search functionality
  }
}
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b bg-background px-6">
    <!-- Search Bar -->
    <div class="flex items-center gap-2 flex-1 max-w-md">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search projects, tasks..."
          class="pl-9"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- Right Section -->
    <div class="flex items-center gap-2">
      <!-- Dark Mode Toggle -->
      <Button 
        variant="ghost" 
        size="icon"
        @click="toggleTheme"
        title="Toggle dark mode"
      >
        <Sun v-if="isDarkMode" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </Button>

      <!-- Notifications -->
      <Button variant="ghost" size="icon" class="relative">
        <Bell class="h-5 w-5" />
        <span 
          v-if="hasNotifications"
          class="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"
        />
      </Button>

      <!-- Date & Time -->
      <div class="text-sm text-muted-foreground hidden md:block">
        {{ formattedDate }}
      </div>
    </div>
  </header>
</template>