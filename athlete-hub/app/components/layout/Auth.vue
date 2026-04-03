<script setup lang="ts">
defineProps<{
  reverse?: boolean
}>()
</script>

<template>
  <div
    class="relative flex items-center justify-center px-4 h-dvh lg:max-w-none lg:px-0"
    :class="{ 'flex-row-reverse': reverse }"
  >
    <div class="relative hidden h-full flex-1 flex-col bg-muted p-10 text-white lg:flex dark:border-r">
      <div
        class="absolute inset-0 bg-cover bg-center"
        style="background-image: url('/image_login.jpg'); opacity: 0.38;"
      />
      <div class="relative z-20 flex items-center text-lg font-medium">
        <div class="relative z-20 flex items-center text-2xl font-semibold tracking-tight">
          <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"
            class="mr-3 w-10 h-auto text-white dark:text-white" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <!-- Left Plate -->
            <rect x="2" y="4" width="6" height="24" rx="2" />
            <rect x="10" y="1" width="6" height="30" rx="2" />
            <!-- Bar -->
            <line x1="16" y1="16" x2="48" y2="16" />
            <!-- Right Plate -->
            <rect x="48" y="1" width="6" height="30" rx="2" />
            <rect x="56" y="4" width="6" height="24" rx="2" />
          </svg>
        </div>

        Athlete Hub
      </div>
      <div class="relative z-20 mt-auto">
        <blockquote class="space-y-2">
          <p class="text-lg">
            &ldquo;Athlete Hub helps coaches unlock the full potential of their players — simplifying data, enhancing
            performance, and empowering smarter decisions every day&rdquo;
          </p>
          <footer class="text-sm">
            V&M
          </footer>
        </blockquote>
      </div>
    </div>
    <div class="mx-auto flex-1 lg:p-8">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
