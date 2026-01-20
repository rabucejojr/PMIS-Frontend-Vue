<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectStatus } from '@/stores/projects'

interface Props {
  status: ProjectStatus
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const statusConfig = {
  draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  active: { label: 'Active', class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  'on-hold': { label: 'On Hold', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  completed: { label: 'Completed', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  archived: { label: 'Archived', class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
}

const config = computed(() => statusConfig[props.status])

const sizeClass = computed(() => 
  props.size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
)
</script>

<template>
  <span 
    :class="[
      'inline-flex items-center rounded-full font-medium',
      config.class,
      sizeClass
    ]"
  >
    {{ config.label }}
  </span>
</template>