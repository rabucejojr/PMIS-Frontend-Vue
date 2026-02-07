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
import { AlertCircle } from 'lucide-vue-next'

interface Props {
  mode?: 'login' | 'register'
  loading?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'login',
  loading: false,
  errorMessage: '',
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
  <Card class="w-full max-w-sm mx-auto shadow-lg">
    <CardHeader class="space-y-2 pb-6">
      <CardTitle class="text-3xl font-bold text-center bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {{ title }}
      </CardTitle>
      <CardDescription class="text-center text-base">
        {{ description }}
      </CardDescription>
    </CardHeader>
    <form @submit="handleSubmit">
      <CardContent class="grid gap-5">
        <div v-if="!isLogin" class="grid gap-2.5">
          <Label for="username" class="text-sm font-semibold">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            required
            class="h-11 transition-all duration-200"
          />
        </div>
        <div class="grid gap-2.5">
          <Label
            for="email"
            class="text-sm font-semibold transition-colors duration-200"
            :class="props.errorMessage ? 'text-red-600 dark:text-red-400' : ''"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            :aria-invalid="!!props.errorMessage"
            class="h-11 transition-all duration-200"
          />
        </div>
        <div class="grid gap-2.5">
          <Label
            for="password"
            class="text-sm font-semibold transition-colors duration-200"
            :class="props.errorMessage ? 'text-red-600 dark:text-red-400' : ''"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            :aria-invalid="!!props.errorMessage"
            class="h-11 transition-all duration-200"
          />
        </div>

        <!-- Error Message -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform opacity-0 -translate-y-2"
          enter-to-class="transform opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform opacity-100 translate-y-0"
          leave-to-class="transform opacity-0 -translate-y-2"
        >
          <div
            v-if="props.errorMessage"
            class="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
          >
            <AlertCircle class="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p class="text-sm font-medium text-red-700 dark:text-red-300 leading-relaxed">
              {{ props.errorMessage }}
            </p>
          </div>
        </Transition>
      </CardContent>

      <CardFooter class="flex flex-col gap-4 pt-6">
        <Button
          type="submit"
          class="w-full h-11 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          :disabled="loading"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Please wait...
          </span>
          <span v-else>{{ submitButtonText }}</span>
        </Button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t"></span>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <button
          type="button"
          class="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 text-center py-2 hover:underline underline-offset-4"
          @click="emit('toggleMode')"
        >
          {{ toggleText }}
        </button>
      </CardFooter>
    </form>
  </Card>
</template>