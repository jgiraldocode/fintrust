<template>
  <div
    :class="[
      variant === 'default' ? 'card' : 'card-hover',
      glass && 'glass',
      className
    ]"
  >
    <div v-if="$slots.header" class="mb-4 pb-4 border-b border-border">
      <slot name="header" />
    </div>

    <div :class="contentClass">
      <slot />
    </div>

    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-border">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'hover'].includes(value)
  },
  glass: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  }
})
</script>

