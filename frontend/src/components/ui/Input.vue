<template>
  <div class="relative">
    <label
      v-if="label"
      :for="id"
      :class="[
        'block text-sm font-medium mb-2 transition-all duration-200',
        error ? 'text-destructive' : 'text-foreground'
      ]"
    >
      {{ label }}
      <span v-if="required" class="text-destructive ml-1">*</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'input',
          error && 'border-destructive focus:ring-destructive',
          icon && 'pl-11',
          className
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
        v-bind="$attrs"
      />

      <div v-if="icon" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {{ icon }}
      </div>
    </div>

    <p v-if="error" class="mt-2 text-sm text-destructive">
      {{ error }}
    </p>

    <p v-else-if="hint" class="mt-2 text-sm text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    required: true
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

