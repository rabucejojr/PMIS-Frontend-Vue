import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/style.css'
import { useSettingsStore } from './stores'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme after pinia is installed
const settingsStore = useSettingsStore()
settingsStore.initTheme()

app.mount('#app')