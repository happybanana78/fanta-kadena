<template>
<div>
  <p :class="[textClass]">
    {{ text }} <span :class="[countdownClass]">{{ countdown }}</span>
  </p>
</div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: 'Time Remaining:',
  },
  targetDate: {
    type: String,
    required: true,
  },
  textClass: {
    type: String,
    default: '',
  },
  countdownClass: {
    type: String,
    default: 'text-slate-300',
  },
});

const countdown = ref('');

const startCountdown = () => {
  const target = new Date(props.targetDate).getTime();

  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = target - now;

    if (distance <= 0) {
      clearInterval(timer);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.value = `${days}d ${hours}h ${minutes}m ${seconds}s`
  }, 1000);
}

onMounted(() => {
  startCountdown();
});
</script>

<style scoped></style>
