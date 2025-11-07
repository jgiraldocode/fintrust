<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex justify-between mb-2">
      <span class="text-sm font-medium text-foreground">{{ label }}</span>
      <span class="text-sm font-medium text-muted-foreground">{{ value }}%</span>
    </div>

    <div :class="['progress', className]">
      <div
        :class="[
          gradient ? 'progress-bar-gradient' : 'progress-bar',
          animated && 'transition-all duration-500'
        ]"
        :style="{ width: `${value}%` }"
        role="progressbar"
        :aria-valuenow="value"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  label: {
    type: String,
    default: ''
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  gradient: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: true
  },
  className: {
    type: String,
    default: ''
  }
})
</script>

