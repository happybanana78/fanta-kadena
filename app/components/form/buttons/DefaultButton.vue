<template>
  <div :class="{ 'flex items-center justify-center': center }">
    <button
        class="flex items-center justify-center cursor-pointer space-x-3 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        :class="{
          'w-full': full,
          'hover:scale-105': scale,
          'hover:bg-indigo-500': fade,
        }"
        :type="type"
        :value="value"
        @click="handleClick"
    >
      <span v-if="!isSlot" class="text-sm font-semibold">{{ text }}</span>
      <DefaultLoader v-if="loading && !isSlot" />

      <span v-if="isSlot">
        <slot/>
      </span>
    </button>
  </div>
</template>

<script setup>
import DefaultLoader from "~/components/loaders/DefaultLoader.vue";

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  isSlot: {
    type: Boolean,
    default: false,
  },
  action: {
    type: Function,
    default: () => {},
  },
  center: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
  value: {
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  full: {
    type: Boolean,
    default: false,
  },
  scale: {
    type: Boolean,
    default: false,
  },
  fade: {
    type: Boolean,
    default: true,
  },
});

const handleClick = () => {
  props.action(props.value);
}
</script>
