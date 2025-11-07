<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    <span v-if="iconLeft && !loading" class="text-xl">{{ iconLeft }}</span>
    <slot />
    <span v-if="iconRight" class="text-xl">{{ iconRight }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'outline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  iconLeft: {
    type: String,
    default: ''
  },
  iconRight: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
})

const buttonClasses = computed(() => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    outline: 'btn-outline',
    ghost: 'btn-ghost'
  }

  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }

  return [
    variants[props.variant],
    sizes[props.size],
    props.className
  ].filter(Boolean).join(' ')
})
</script>
