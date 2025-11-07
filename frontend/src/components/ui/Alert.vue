<template>
  <div
    :class="[
      'alert',
      variantClasses[variant],
      className
    ]"
    role="alert"
  >
    <div v-if="icon" class="absolute left-4 top-4 text-xl">
      {{ icon }}
    </div>

    <div :class="icon && 'pl-7'">
      <h5 v-if="title" class="mb-1 font-medium leading-none tracking-tight">
        {{ title }}
      </h5>
      <div class="text-sm [&_p]:leading-relaxed">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
})

const variantClasses = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error'
}
</script>

