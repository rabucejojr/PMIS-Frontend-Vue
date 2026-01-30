import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/style.css'
import { useSettingsStore, useAuthStore } from './stores'

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