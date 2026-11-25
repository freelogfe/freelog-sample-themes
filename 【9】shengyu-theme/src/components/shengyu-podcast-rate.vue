<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { podcastRates } from '@/utils/podcast-playback';
defineProps<{ modelValue: number }>();
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();
const menu = ref<HTMLDetailsElement>();
function close() { if (menu.value) menu.value.open = false; }
function choose(rate: number) { emit('update:modelValue', rate); close(); }
function outside(event: PointerEvent) { if (!menu.value?.contains(event.target as Node)) close(); }
onMounted(() => document.addEventListener('pointerdown', outside));
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside));
</script>
<template>
  <details ref="menu" class="sy-podcast-rate" @keydown.esc.stop.prevent="close">
    <summary :aria-label="`播放速度 ${modelValue} 倍`">{{ modelValue }}x</summary>
    <div class="sy-podcast-rate-menu" role="group" aria-label="播放速度">
      <button v-for="rate in podcastRates" :key="rate" :aria-pressed="modelValue === rate" @click="choose(rate)">{{ rate }}x</button>
    </div>
  </details>
</template>
<style scoped>
.sy-podcast-rate { position: relative; flex-shrink: 0; color: var(--sy-secondary); font: 400 14px/20px Inter, sans-serif; }
summary { list-style: none; cursor: pointer; border-radius: 4px; padding: 5px; min-width: 40px; text-align: center; }
summary::-webkit-details-marker { display: none; }
summary:hover { background: var(--sy-subtle); }
.sy-podcast-rate-menu { position: absolute; bottom: 64px; left: 50%; transform: translateX(-50%); width: 80px; padding: 5px; border-radius: 10px; background: var(--sy-floating-bg); backdrop-filter: blur(20px); z-index: 105; }
.sy-podcast-rate-menu button { display: block; width: 100%; height: 30px; padding: 5px; border-radius: 4px; font: inherit; color: var(--sy-text); background: transparent; }
.sy-podcast-rate-menu button:hover { background: var(--sy-subtle); }
.sy-podcast-rate-menu button[aria-pressed="true"] { background: var(--sy-brand); }
</style>
