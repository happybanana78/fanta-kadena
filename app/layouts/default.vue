<template>
  <UApp>
    <main class="bg-slate-900 w-full h-screen mb-20">
      <div class="flex justify-end px-5">
        <button
          class="flex items-center space-x-4 mt-6 bg-white text-slate-900 p-2 rounded-lg hover:bg-slate-300 transition-all ease-in duration-200"
        >
          Connect Wallet
        </button>
      </div>

      <slot />
    </main>
  </UApp>
</template>

<script setup></script>
