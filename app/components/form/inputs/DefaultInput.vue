<template>
  <div class="space-y-1">
    <label
        v-if="label"
        :for="id"
        class="block text-sm font-semibold text-white/90 tracking-wide"
    >
      {{ label }}
    </label>
    <input
        :type="type"
        :name="name"
        :value="modelValue"
        :id="id"
        class="w-full rounded-xl border border-slate-500 bg-slate-800/80 text-white text-base p-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
        :placeholder="placeholder"
        @input="emit('update:modelValue', $event.target.value)"
    >
    <div v-if="error" class="flex justify-start mt-1">
      <p class="text-red-400 text-sm font-medium">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);
</script>
