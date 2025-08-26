<template>
  <div class="space-y-2 animate-fadeIn">
    <label
        v-if="label"
        :for="id"
        class="block text-sm font-semibold text-white/90 tracking-wide"
    >
      {{ label }}
    </label>

    <div class="flex items-center space-x-3">
      <input
          :type="type"
          :name="name"
          v-model="currentOption"
          :id="id"
          class="flex-1 rounded-xl border border-slate-500 bg-slate-800/80 text-white text-base p-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
          :placeholder="placeholder"
      >

      <DefaultButton
          :is-slot="true"
          :action="addOption"
      >
        <div class="flex items-center space-x-2">
          <UIcon name="ic:baseline-plus" class="size-5" />
          <span class="text-sm font-medium">Add</span>
        </div>
      </DefaultButton>
    </div>

    <div v-if="error" class="flex justify-start mt-1">
      <p class="text-red-400 text-sm font-medium">{{ error }}</p>
    </div>

    <div v-if="options.length > 0" class="p-3 bg-slate-700/60 rounded-xl mt-5 space-y-2 max-h-[300px] overflow-auto border border-slate-600 shadow-inner">
      <div
          v-for="option in options"
          :key="option.id"
          class="bg-slate-800 text-white flex items-center justify-between px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition duration-150"
      >
        <span class="text-sm font-medium">{{ option.name }}</span>
        <button
            type="button"
            class="flex items-center rounded-lg p-2 text-red-500 hover:text-red-400 transition duration-150 cursor-pointer"
            @click="removeOption(option.id)"
        >
          <UIcon name="ic:baseline-close" class="size-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from 'uuid';
import DefaultButton from "~/components/form/buttons/DefaultButton.vue";

defineProps({
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

const currentOption = ref('');

const options = ref([]);

const addOption = () => {
  if (!currentOption.value) {
    return;
  }

  options.value.push({
    id: uuidv4(),
    name: currentOption.value,
    isRight: false,
  });

  currentOption.value = '';

  emit('update-options', options.value);
}

const removeOption = (id) => {
  const index = options.value.findIndex(obj => obj.id === id);

  if (index !== -1) {
    options.value.splice(index, 1);
  }

  emit('update-options', options.value);
}

const emit = defineEmits(['update-options']);
</script>
