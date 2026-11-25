<script setup lang="ts">
import SongSkeleton from './shengyu-song-skeleton.vue';
import '@/assets/css/shengyu-skeleton.css';
defineProps<{ kind: 'songs' | 'albums' | 'playlists' | 'podcasts' }>();
</script>
<template>
  <div class="sy-library-skeleton" role="status" :aria-label="kind === 'podcasts' ? '正在加载播客内容' : '正在加载音乐内容'" aria-busy="true">
    <div aria-hidden="true">
      <SongSkeleton v-if="kind === 'songs'" />
      <div v-else class="sy-grid" :class="{ albums: kind === 'albums' }">
        <div v-for="index in (kind === 'albums' ? 4 : 5)" :key="index" class="sy-skeleton-card">
          <div class="sy-skeleton-art" :class="{ 'is-album': kind === 'albums' }">
            <span v-if="kind === 'albums'" class="sy-skeleton-block sy-skeleton-disc"></span>
            <span class="sy-skeleton-block sy-skeleton-cover"></span>
          </div>
          <span class="sy-skeleton-block sy-skeleton-title"></span>
          <span v-if="kind === 'podcasts'" class="sy-skeleton-block sy-skeleton-subtitle"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.sy-skeleton-card { min-width: 0; }
.sy-skeleton-art { position: relative; }
.sy-skeleton-art.is-album { padding-right: 21.35%; }
.sy-skeleton-cover { position: relative; width: 100%; aspect-ratio: 1; border-radius: 10px; }
.sy-skeleton-art .sy-skeleton-disc { position: absolute; right: 0; top: 0; width: 78.65%; aspect-ratio: 1; border-radius: 50%; }
.sy-skeleton-title { width: 75%; height: 20px; margin-top: 10px; }
.sy-skeleton-subtitle { width: 25%; height: 18px; margin-top: 5px; }
@media (max-width: 640px) { .sy-skeleton-card:nth-child(n + 5) { display: none; } }
</style>
