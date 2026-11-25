<script setup lang="ts">
import { themeAssets } from "@/assets/theme";
import { computed, onBeforeUnmount, ref } from 'vue';
import { useGlobalStore } from '@/store/global';
import { useMyCollection } from '@/utils/hooks';
import { authAbnormal, detailLocation, duration, entryKey, unplayable, type AudioEntry } from '@/api/shengyu';
import { authErrorIcon, freezeIcon } from '@/utils/status-icons';

import { musicDetailIntro, podcastPublishedTime } from '@/utils/shengyu-detail';
import Card from './shengyu-card.vue';
import PlayStatus from './play-status.vue';

const props = defineProps<{ item: AudioEntry }>();
const emit = defineEmits<{ play: [item: AudioEntry]; collect: [item: AudioEntry]; share: [item: AudioEntry]; authorize: [item: AudioEntry] }>();
const store = useGlobalStore();
const current = computed(() => store.playingInfo && entryKey(store.playingInfo) === entryKey(props.item));
const collected = computed(() => useMyCollection.ifExist(props.item));
const published = computed(() => podcastPublishedTime(props.item));
const menu = ref<HTMLDetailsElement>();
const trigger = ref<HTMLElement>();
function closeMenu() { if (menu.value) menu.value.open = false; }
function outside(event: PointerEvent) { if (!menu.value?.contains(event.target as Node)) closeMenu(); }
function syncMenu() {
  document.removeEventListener('pointerdown', outside);
  if (menu.value?.open) document.addEventListener('pointerdown', outside);
}
function action(name: 'collect' | 'share') {
  closeMenu();
  if (name === 'collect') emit('collect', props.item);
  else emit('share', props.item);
}
function escapeMenu() { closeMenu(); trigger.value?.focus(); }
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside));
</script>

<template>
  <article class="sy-podcast-episode" :class="{ unavailable: unplayable(item), current }">
    <Card class="sy-episode-art" cover-only :item="item" @play="emit('play', $event)" />
    <div class="sy-episode-copy">
      <p v-if="published" class="sy-episode-published">发布时间 <time>{{ published }}</time></p>
      <div class="sy-episode-title-row">
        <img v-if="item.articleInfo?.status === 2" class="sy-episode-state" :src="freezeIcon" alt="封禁" />
        <span v-else-if="item.onlineStatus === 0" class="sy-episode-offline">已下架</span>
        <img v-else-if="authAbnormal(item)" class="sy-episode-state" :src="authErrorIcon" alt="授权链异常" title="授权链异常" />
        <button v-else-if="item.defaulterIdentityType === 4" class="sy-episode-lock" :aria-label="`授权 ${item.exhibitTitle}`" @click="emit('authorize', item)"><i class="freelog fl-icon-suoding" aria-hidden="true"></i></button>
        <RouterLink class="sy-episode-title" :to="detailLocation(item)" :title="item.exhibitTitle">{{ item.exhibitTitle }}</RouterLink>
      </div>
      <p v-if="musicDetailIntro(item)" class="sy-episode-intro">{{ musicDetailIntro(item) }}</p>
    </div>
    <div class="sy-episode-duration">
      <PlayStatus v-if="current" :playing="store.playing" :status-text="false" color="var(--sy-brand)" />
      <span v-else>{{ duration(item) === '--:--' ? '00:00' : duration(item) }}</span>
    </div>
    <div class="sy-episode-menu-slot">
      <details ref="menu" class="sy-card-menu" @toggle="syncMenu" @keydown.esc.stop.prevent="escapeMenu">
        <summary ref="trigger" :aria-label="`更多操作 ${item.exhibitTitle}`"><img :src="themeAssets.episodeMore" alt="" /></summary>
        <div class="sy-card-menu-panel">
          <button @click="action('share')"><i class="freelog fl-icon-icon_fenxiang1" aria-hidden="true"></i>分享</button>
          <button @click="action('collect')"><i class="freelog" :class="collected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'" aria-hidden="true"></i>{{ collected ? '取消收藏' : '收藏' }}</button>
        </div>
      </details>
    </div>
  </article>
</template>

<style scoped>
.sy-podcast-episode { display: flex; align-items: center; gap: 10px; min-height: 132px; padding: 10px; border-radius: 10px; }
.sy-podcast-episode:nth-child(odd) { background: var(--sy-card); }
.sy-podcast-episode:hover { background: var(--sy-hover); }
.sy-podcast-episode.unavailable { opacity: .4; }
.sy-episode-art { flex: 0 0 112px; width: 112px; }
.sy-episode-art :deep(.sy-cover), .sy-episode-art :deep(.sy-cover-button), .sy-episode-art :deep(.sy-cover-overlay) { border-radius: 6px; }
.sy-episode-art :deep(.sy-cover-play) { width: 50px; height: 50px; }
.sy-episode-art :deep(.sy-cover-play img) { width: 28px; height: 28px; }
.sy-episode-art :deep(.sy-cover-play i.freelog) { font-size: 28px; }
.sy-episode-copy { flex: 0 1 750px; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.sy-episode-published, .sy-episode-intro, .sy-episode-duration { color: var(--sy-secondary); font-size: 12px; line-height: 18px; }
.sy-episode-published { display: flex; gap: 10px; }
.sy-episode-title-row { display: flex; align-items: center; gap: 5px; min-width: 0; }
.sy-episode-state { width: 16px; height: 16px; object-fit: contain; flex-shrink: 0; }
.sy-episode-offline { font-size: 12px; flex-shrink: 0; }
.sy-episode-title { font-size: 16px; line-height: 22px; }
.sy-episode-title, .sy-episode-intro { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow-wrap: anywhere; }
.sy-episode-title:hover, .current .sy-episode-title { color: var(--sy-brand); }
.sy-episode-lock { display: flex; flex-shrink: 0; padding: 0; background: transparent; color: var(--sy-text); }
.sy-episode-duration { flex: 1; min-width: 90px; padding: 0 20px; text-align: center; }
.sy-episode-duration :deep(.play-status) { justify-content: center; }
.sy-episode-menu-slot { flex: 0 0 44px; padding: 10px; }
.sy-episode-menu-slot .sy-card-menu, .sy-episode-menu-slot summary { width: 24px; height: 24px; }
.sy-episode-menu-slot summary { opacity: 1; padding: 2px; border-radius: 4px; }
.sy-episode-menu-slot summary img { width: 17.5px; height: 2.5px; object-fit: contain; }
.sy-episode-menu-slot .sy-card-menu-panel { top: 24px; }
:global([data-theme="light"] .sy-episode-menu-slot summary img) { filter: invert(1); }
@media (max-width: 1000px) { .sy-episode-copy { flex: 1; } .sy-episode-duration { flex: 0 0 90px; padding: 0 5px; } }
@media (max-width: 700px) {
  .sy-podcast-episode { display: grid; grid-template-columns: 80px minmax(0, 1fr) 24px; gap: 8px 10px; }
  .sy-episode-art { width: 80px; grid-row: 1 / 3; align-self: start; }
  .sy-episode-copy { gap: 5px; }
  .sy-episode-title { font-size: 14px; line-height: 20px; }
  .sy-episode-published { flex-wrap: wrap; gap: 0 5px; }
  .sy-episode-duration { grid-column: 2; grid-row: 2; padding: 0; text-align: left; min-width: 0; }
  .sy-episode-duration :deep(.play-status) { justify-content: flex-start; }
  .sy-episode-menu-slot { grid-column: 3; grid-row: 1 / 3; padding: 0; }
}
</style>
