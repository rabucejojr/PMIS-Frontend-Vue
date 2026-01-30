import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

export interface NotificationSettings {
  email: boolean
  push: boolean
  taskAssigned: boolean
  taskDue: boolean
  projectUpdates: boolean
  mentions: boolean
  weeklyDigest: boolean
}

export interface UserPreferences {
  language: string
  timezone: string
  dateFormat: string
  theme: Theme
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const theme = ref<Theme>('system')
  const notificationSettings = ref<NotificationSettings>({
    email: true,
    push: true,
    taskAssigned: true,
    taskDue: true,
    projectUpdates: true,
    mentions: true,
    weeklyDigest: false
  })
  
  const userPreferences = ref<UserPreferences>({
    language: 'en',
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY',
    theme: 'system'
  })

  // Initialize theme from localStorage
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      theme.value = savedTheme
      userPreferences.value.theme = savedTheme
      applyTheme(savedTheme)
    } else {
      applyTheme('system')
    }
  }

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else if (newTheme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  // Watch for theme changes
  watch(theme, (newTheme) => {
    userPreferences.value.theme = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  })

  // Actions
  const updateTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    notificationSettings.value = {
      ...notificationSettings.value,
      ...settings
    }
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings.value))
  }

  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    userPreferences.value = {
      ...userPreferences.value,
      ...preferences
    }
    
    if (preferences.theme) {
      theme.value = preferences.theme
    }
    
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences.value))
  }

  const loadSettings = () => {
    // Load notification settings
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      try {
        notificationSettings.value = JSON.parse(savedNotifications)
      } catch {
        localStorage.removeItem('notificationSettings')
      }
    }

    // Load user preferences
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      try {
        userPreferences.value = JSON.parse(savedPreferences)
        theme.value = userPreferences.value.theme
      } catch {
        localStorage.removeItem('userPreferences')
      }
    }

    initTheme()
  }

  return {
    // State
    theme,
    notificationSettings,
    userPreferences,
    // Actions
    updateTheme,
    updateNotificationSettings,
    updateUserPreferences,
    loadSettings,
    initTheme
  }
})