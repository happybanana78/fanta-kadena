<template>
  <div class="d-loader" :class="[color, size]"></div>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'bg-slate-900',
  },
  size: {
    type: String,
    default: 'w-5',
  },
});
</script>

<style scoped>
.d-loader {
  padding: 5px;
  aspect-ratio: 1;
  border-radius: 50%;
  --_m:
      conic-gradient(#0000 10%,#000),
      linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
}

@keyframes l3 {to{transform: rotate(1turn)}}
</style>
