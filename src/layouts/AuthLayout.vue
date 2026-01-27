<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/40 p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Branding -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold">DOST Surigao del Norte</h1>
        <p class="text-muted-foreground mt-2">
          Project Management Information System
        </p>
        <p class="text-sm text-muted-foreground">
          DOST Surigao del Norte
        </p>
      </div>

      <!-- Auth Forms -->
      <RouterView />
    </div>
  </div>
</template>