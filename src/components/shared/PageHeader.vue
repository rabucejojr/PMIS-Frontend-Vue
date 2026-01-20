<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

interface Breadcrumb {
  label: string
  to?: string
}

interface Props {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
}

defineProps<Props>()
</script>

<template>
  <div class="mb-6">
    <!-- Breadcrumbs -->
    <nav v-if="breadcrumbs && breadcrumbs.length" class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <RouterLink 
          v-if="crumb.to"
          :to="crumb.to"
          class="hover:text-foreground transition-colors"
        >
          {{ crumb.label }}
        </RouterLink>
        <span v-else class="text-foreground">{{ crumb.label }}</span>
        <ChevronRight v-if="index < breadcrumbs.length - 1" class="h-4 w-4" />
      </template>
    </nav>

    <!-- Title & Description -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p v-if="description" class="text-muted-foreground mt-1">{{ description }}</p>
      </div>
      <div class="flex gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>