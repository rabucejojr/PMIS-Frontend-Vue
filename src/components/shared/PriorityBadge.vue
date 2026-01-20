<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-vue-next'

type Priority = 'low' | 'medium' | 'high' | 'critical' | 'urgent'

interface Props {
  priority: Priority
  size?: 'sm' | 'md'
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showIcon: true
})

const priorityConfig = {
  low: { 
    label: 'Low', 
    class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: ArrowDown
  },
  medium: { 
    label: 'Medium', 
    class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    icon: Minus
  },
  high: { 
    label: 'High', 
    class: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    icon: ArrowUp
  },
  critical: { 
    label: 'Critical', 
    class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    icon: AlertCircle
  },
  urgent: { 
    label: 'Urgent', 
    class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    icon: AlertCircle
  }
}

const config = computed(() => priorityConfig[props.priority])

const sizeClass = computed(() => 
  props.size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
)

const iconSize = computed(() => 
  props.size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
)
</script>

<template>
  <span 
    :class="[
      'inline-flex items-center gap-1 rounded-full font-medium',
      config.class,
      sizeClass
    ]"
  >
    <component v-if="showIcon" :is="config.icon" :class="iconSize" />
    {{ config.label }}
  </span>
</template>