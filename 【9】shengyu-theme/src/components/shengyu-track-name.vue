<script setup lang="ts">
import { themeAssets } from "@/assets/theme";
import { authAbnormal, detailLocation, type AudioEntry } from '@/api/shengyu';
import { authErrorIcon, freezeIcon } from '@/utils/status-icons';

defineProps<{ item: AudioEntry }>();
defineEmits<{ authorize: [item: AudioEntry] }>();
</script>

<template>
  <div class="sy-track-name" role="cell">
    <RouterLink class="sy-track-cover-link" :to="detailLocation(item)" :aria-label="item.exhibitTitle"><img :src="item.coverImages?.[0] || themeAssets.defaultCover" alt="" /></RouterLink>
    <div class="sy-track-title-area">
      <img v-if="item.articleInfo?.status === 2" class="sy-track-state" :src="freezeIcon" alt="封禁" title="封禁" />
      <span v-else-if="item.onlineStatus === 0" class="sy-track-offline">已下架</span>
      <img v-else-if="authAbnormal(item)" class="sy-track-state" :src="authErrorIcon" alt="授权链异常" title="授权链异常" />
      <button v-else-if="item.defaulterIdentityType === 4" class="sy-track-auth" :aria-label="`授权 ${item.exhibitTitle}`" title="未授权，点击授权" @click="$emit('authorize', item)"><i class="freelog fl-icon-suoding" aria-hidden="true"></i></button>
      <RouterLink class="sy-track-title-link" :to="detailLocation(item)" :title="item.exhibitTitle">{{ item.exhibitTitle }}</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.sy-track-cover-link { flex: 0 0 50px; }
.sy-track-title-area { display: flex; align-items: center; gap: 5px; min-width: 0; }
.sy-track-title-link { min-width: 0; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow-wrap: anywhere; }
.sy-track-title-link:hover { color: var(--sy-brand); text-decoration: underline; text-underline-position: under; }
.sy-track-name .sy-track-state { width: 16px; height: 16px; object-fit: contain; border: 0; border-radius: 0; }
.sy-track-offline { flex-shrink: 0; font-size: 12px; color: var(--sy-secondary); }
.sy-track-auth { display: flex; align-items: center; padding: 0; flex-shrink: 0; color: var(--sy-text); background: transparent; }
.sy-track-auth:hover { color: var(--sy-brand); background: transparent; }
.sy-track-auth i { font-size: 16px; }
</style>
