import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/style.css'
import { useSettingsStore, useAuthStore } from './stores'

// Handle Vite preload errors
window.addEventListener('vite:preloadError', (event) => {
  console.error('Vite preload error:', event)
  window.location.reload()
})

// Handle general chunk load errors
let isReloading = false
window.addEventListener('error', (event) => {
  const isChunkError =
    event.message?.includes('Failed to fetch dynamically imported module') ||
    event.message?.includes('error loading dynamically imported module')

  if (isChunkError && !isReloading) {
    isReloading = true
    console.warn('Chunk load error detected, reloading page...')
    window.location.reload()
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores after pinia is installed
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

// Load settings and restore auth state
settingsStore.loadSettings()
authStore.initAuth()

app.mount('#app')