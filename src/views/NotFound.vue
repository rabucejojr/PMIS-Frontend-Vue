<!-- views/NotFound.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const router = useRouter()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold">404</h1>
      <p class="text-muted-foreground mt-4">Page not found</p>
      <Button class="mt-6" @click="router.push('/dashboard')">
        Go to Dashboard
      </Button>
    </div>
  </div>
</template>