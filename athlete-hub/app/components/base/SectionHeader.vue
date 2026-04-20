<script setup lang="ts">
defineProps<{ n: number; title: string }>()
</script>

<template>
  <div class="flex items-center gap-2 border-b border-border pb-3">
    <span class="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-[10px] font-black shrink-0">
      {{ n }}
    </span>
    <h3 class="text-sm font-black uppercase tracking-tighter">{{ title }}</h3>
  </div>
</template>
