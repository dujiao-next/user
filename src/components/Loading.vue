<template>
  <transition name="fade">
    <div v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center theme-overlay backdrop-blur-xl transition-all duration-500">
      <div class="relative flex flex-col items-center gap-8">
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 rounded-full border theme-border"></div>
          <div
            class="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin theme-text-primary">
          </div>
          <div
            class="absolute inset-[10px] rounded-full theme-panel-muted border theme-border flex items-center justify-center">
            <div
              class="w-2 h-2 rounded-full bg-current theme-text-muted">
            </div>
          </div>
          <div
            class="absolute inset-[-8px] rounded-full border border-transparent border-b-gray-300 dark:border-b-white/20 animate-spin-reverse">
          </div>
        </div>

        <!-- Text -->
        <div class="flex flex-col items-center gap-2">
          <div class="text-xl font-bold tracking-[0.2em] theme-text-primary animate-pulse">
            LOADING
          </div>
          <div class="flex gap-1 h-1">
            <div class="w-1 h-1 bg-current theme-text-muted rounded-full animate-bounce delay-100"></div>
            <div class="w-1 h-1 bg-current theme-text-muted rounded-full animate-bounce delay-200"></div>
            <div class="w-1 h-1 bg-current theme-text-muted rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-spin-reverse {
  animation: spin-reverse 3s linear infinite;
}

@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}
</style>
