<template>
  <span
    :class="[
      'badge',
      variantClasses[variant],
      className
    ]"
  >
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'success', 'danger', 'warning'].includes(value)
  },
  className: {
    type: String,
    default: ''
  }
})

const variantClasses = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  outline: 'badge-outline',
  success: 'bg-green-600 text-white',
  danger: 'bg-red-600 text-white',
  warning: 'bg-yellow-600 text-white'
}
</script>

