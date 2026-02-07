<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthForm from './AuthForm.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const errorMessage = ref('')

const handleSubmit = async (data: { email: string; password: string; username?: string }) => {
  errorMessage.value = '' // Clear previous errors
  let result

  if (mode.value === 'login') {
    result = await authStore.login(data.email, data.password)
  } else {
    result = await authStore.register(data.username!, data.email, data.password)
  }

  if (result.success) {
    // Redirect to original page or dashboard
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } else {
    errorMessage.value = result.error || 'Authentication failed'
  }
}

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMessage.value = '' // Clear error when switching modes
}
</script>

<template>
  <AuthForm
    :mode="mode"
    :loading="authStore.isLoading"
    :error-message="errorMessage"
    @submit="handleSubmit"
    @toggle-mode="toggleMode"
  />
</template>