<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell, Search, Sun, Moon } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores'

const settingsStore = useSettingsStore()

const searchQuery = ref('')
const hasNotifications = ref(true)

const isDarkMode = computed(() => {
  if (settingsStore.theme === 'dark') return true
  if (settingsStore.theme === 'light') return false
  // System theme - check if dark class is applied
  return document.documentElement.classList.contains('dark')
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
        {{ new Date().toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) }}
      </div>
    </div>
  </header>
</template>