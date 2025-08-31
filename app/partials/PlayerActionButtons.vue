<template>
  <div>
    <div v-if="generalError" class="flex justify-center mt-2 mb-6">
      <p class="text-red-400 text-sm font-medium">{{ generalError }}</p>
    </div>

    <div class="flex justify-end space-x-4">
      <DefaultButton
          v-if="!alreadyVoted && !game.is_expired"
          text="Join Game"
          :scale="true"
          :action="() => emit('show-options')"
      />
      <DefaultButton
          text="Back to Games"
          :scale="true"
          background-color="bg-slate-500"
          hover-color="hover:bg-slate-400"
          link="/"
      />
    </div>
  </div>
</template>

<script setup>
import DefaultButton from "~/components/form/buttons/DefaultButton.vue";

const props = defineProps({
  game: {
    type: Object,
    default: {},
    required: true,
  },
  account: {
    type: String,
    default: '',
    required: true,
  },
  alreadyVoted: {
    type: Boolean,
    required: true,
  },
});

const refunding = ref(false);

const generalError = ref('');

const refund = async () => {

}

const emit = defineEmits(['show-options']);
</script>

<style scoped></style>
