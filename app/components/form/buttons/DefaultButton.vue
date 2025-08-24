<template>
  <div
    :class="{
      'flex items-center justify-center': center,
    }"
  >
    <button
      class="flex items-center cursor-pointer space-x-4 mt-6 bg-white text-slate-900 p-2 rounded-lg hover:bg-slate-300 transition-all ease-in duration-200"
      :type="type"
      @click="handleClick"
    >
      <span>{{ text }}</span>
      <DefaultLoader v-if="loading"/>
    </button>
  </div>
</template>

<script setup>
import DefaultLoader from "~/components/loaders/DefaultLoader.vue";

const props = defineProps({
  text: {
    type: String,
    default: '',
    required: true,
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
  loading: {
    type: Boolean,
    default: false,
  },
});

const handleClick = () => {
  props.action();
}
</script>
