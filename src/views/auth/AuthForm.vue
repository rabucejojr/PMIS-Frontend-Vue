<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  mode?: 'login' | 'register'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'login',
  loading: false,
})

const emit = defineEmits<{
  submit: [data: { email: string; password: string; username?: string }]
  toggleMode: []
}>()

const isLogin = computed(() => props.mode === 'login')

const title = computed(() => isLogin.value ? 'Login' : 'Create Account')
const description = computed(() => 
  isLogin.value 
    ? 'Enter your credentials to access your account' 
    : 'Enter your details to create a new account'
)
const submitButtonText = computed(() => isLogin.value ? 'Login' : 'Register')
const toggleText = computed(() => 
  isLogin.value 
    ? "Don't have an account? Register" 
    : "Already have an account? Login"
)

const handleSubmit = (e: Event) => {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)
  const data: { email: string; password: string; username?: string } = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  
  if (!isLogin.value) {
    data.username = formData.get('username') as string
  }
  
  emit('submit', data)
}
</script>

<template>
  <Card class="w-full max-w-sm mx-auto">
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold text-center">{{ title }}</CardTitle>
      <CardDescription class="text-center">{{ description }}</CardDescription>
    </CardHeader>
    <form @submit="handleSubmit">
      <CardContent class="grid gap-4">
        <div v-if="!isLogin" class="grid gap-2">
          <Label for="username">Username</Label>
          <Input 
            id="username" 
            name="username"
            type="text" 
            placeholder="johndoe" 
            required 
          />
        </div>
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            required 
          />
        </div>
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input 
            id="password" 
            name="password"
            type="password"
            placeholder="••••••••" 
            required 
          />
        </div>
      </CardContent>
      <CardFooter class="flex flex-col gap-4">
        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Please wait...' : submitButtonText }}
        </Button>
        <button 
          type="button"
          class="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
          @click="emit('toggleMode')"
        >
          {{ toggleText }}
        </button>
      </CardFooter>
    </form>
  </Card>
</template>