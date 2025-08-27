<template>
  <div :class="{ 'flex items-center justify-center': center }">
    <button
        v-if="!link"
        class="flex items-center justify-center cursor-pointer space-x-3 px-5 py-3 rounded-xl shadow-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        :class="[backgroundColor, textColor, hoverColor ? hoverColor : (fade ? 'hover:bg-indigo-500' : ''), {
          'w-full': full,
          'hover:scale-105': scale,
        }]"
        :type="type"
        :value="value"
        :disabled="disabled"
        @click="handleClick"
    >
      <span v-if="!isSlot" class="text-sm font-semibold">{{ text }}</span>
      <DefaultLoader v-if="loading && !isSlot" />

      <span v-if="isSlot">
        <slot/>
      </span>
    </button>

    <nuxt-link
        v-if="link"
        class="flex items-center justify-center cursor-pointer space-x-3 px-5 py-3 rounded-xl shadow-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        :class="[backgroundColor, textColor, hoverColor ? hoverColor : (fade ? 'hover:bg-indigo-500' : ''), {
          'w-full': full,
          'hover:scale-105': scale,
        }]"
        :to="link"
    >
      <span class="text-sm font-semibold">{{ text }}</span>
    </nuxt-link>
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
  link: {
    type: String,
    default: '',
  },
  center: {
    type: Boolean,
    default: false,
  },
  disabled: {
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
  textColor: {
    type: String,
    default: 'text-white',
  },
  backgroundColor: {
    type: String,
    default: 'bg-indigo-600',
  },
  hoverColor: {
    type: String,
    default: '',
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
