<template>
  <div>
    <label
        v-if="label"
        :for="id"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      {{ label }}
    </label>

    <div class="flex items-center space-x-4">
      <input
          :type="type"
          :name="name"
          v-model="currentOption"
          :id="id"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          :placeholder="placeholder"
      >

      <div>
        <button
          class="bg-green-600 flex items-center space-x-1 cursor-pointer rounded-lg p-2 text-white hover:bg-green-500 transition ease-in duration-200"
          @click="addOption"
          type="button"
        >
          <span>Add</span>
          <UIcon name="ic:baseline-plus" class="size-5" />
        </button>
      </div>
    </div>

    <div v-if="error" class="flex justify-center mt-1">
      <p class="text-red-400 text-sm">{{ error }}</p>
    </div>

    <div v-if="options.length > 0" class="p-2 bg-slate-200 mt-5 rounded-sm space-y-2 max-h-[300px] overflow-auto">
      <div
        v-for="option in options"
        :key="option.id"
        class="bg-slate-800 text-white flex items-center justify-between space-x-4 p-2 rounded-sm"
      >
        <span>{{ option.name }}</span>
        <div>
          <button type="button" class="flex items-center rounded-lg p-2 text-red-600 hover:text-red-500 transition ease-in duration-200 cursor-pointer">
            <UIcon name="ic:baseline-close" class="size-5" @click="removeOption(option.id)" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from 'uuid';

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
