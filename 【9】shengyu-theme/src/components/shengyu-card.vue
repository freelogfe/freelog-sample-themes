<script setup lang="ts">
import { themeAssets } from "@/assets/theme";
import { computed, ref, onBeforeUnmount } from "vue";
import { RouterLink } from 'vue-router';
import { useGlobalStore } from "@/store/global";
import { useMyCollection } from "@/utils/hooks";
import { musicCardMetadata } from '@/utils/shengyu-detail';
import { formatDate } from '@/utils/common';
import { authErrorIcon, freezeIcon } from '@/utils/status-icons';

import {
  artist,
  properties,
  duration,
  detailLocation,
  entryKey,
  isCollection,
  isPodcast,
  podcastSubtitle,
  entryCategory,
  authAbnormal,
  unplayable,
  type AudioEntry,
} from "@/api/shengyu";
const props = defineProps<{ item: AudioEntry; mode?: string; coverOnly?: boolean }>();
const emit = defineEmits<{ play: [item: AudioEntry]; collect: [item: AudioEntry]; authorize: [item: AudioEntry] }>();
const compact = computed(() => ['song', 'episode'].includes(props.mode || ''));
const store = useGlobalStore();
const collectionCard = computed(() => isCollection(props.item) && ['albums', 'playlists'].includes(entryCategory(props.item)));
const metadata = computed(() => musicCardMetadata(props.item));
const parentLabel = computed(() => {
  if (props.mode === 'episode') return props.item.albumName || '单集';
  if (props.item.itemId && props.item.albumName) return props.item.albumName;
  const album = properties(props.item).album_name;
  return String(album || '').trim() || String(props.item.albumName || '').trim() || '单曲';
});
const parentLocation = computed(() => {
  const item = props.item;
  if (!item.itemId || !item.exhibitId) return undefined;
  if (!item.albumName && !String(item.parentResourceType || '').includes('音乐专辑')) return undefined;
  return { path: '/detail', query: { id: item.exhibitId } };
});
const publishedTime = computed(() => {
  if (!props.item.updateDate) return '';
  const date = new Date(props.item.updateDate);
  return Number.isNaN(date.getTime()) ? '' : formatDate(date, 'YYYY/MM/DD hh:mm');
});
const playing = computed(() => store.playing && store.playingInfo && (isCollection(props.item)
  ? store.playingInfo.exhibitId === props.item.exhibitId
  : entryKey(store.playingInfo) === entryKey(props.item)));
const isCollected = computed(() => useMyCollection.ifExist(props.item));
const menu = ref<HTMLDetailsElement>();
const menuTrigger = ref<HTMLElement>();
function closeMenu() { if (menu.value) menu.value.open = false; }
function outside(event: PointerEvent) {
  if (!menu.value?.contains(event.target as Node)) closeMenu();
}
function syncMenu() {
  document.removeEventListener('pointerdown', outside);
  if (menu.value?.open) document.addEventListener('pointerdown', outside);
}
function collect() { closeMenu(); emit('collect', props.item); }
function share() {
  closeMenu();
  store.setData({ key: 'shareInfo', value: { show: true, exhibit: {
    ...props.item,
    shareUrlGenerationException: '声屿主题',
    parentArticleType: props.item.parentArticleType || (props.item.itemId ? 2 : 1),
  } } });
}
function escapeMenu() { closeMenu(); menuTrigger.value?.focus(); }
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside));
</script>
<template>
  <article class="sy-card" :class="[mode, { 'sy-podcast-card': !compact && isPodcast(item), 'sy-collection-card': collectionCard, 'sy-card-unavailable': collectionCard && unplayable(item) }]">
    <div class="sy-card-art" :class="{ 'sy-album-art': mode === 'album' }">
      <img
        v-if="mode === 'album'"
        class="sy-disc"
        :src="themeAssets.record"
        alt=""
      />
      <component :is="coverOnly ? 'div' : RouterLink" class="sy-cover-button" :to="coverOnly ? undefined : detailLocation(item)"
        ><img
          class="sy-cover"
          :loading="coverOnly ? 'eager' : 'lazy'"
          :src="item.coverImages?.[0] || themeAssets.defaultCover"
          :alt="item.exhibitTitle"
      /></component>
      <div class="sy-cover-overlay">
        <button class="sy-cover-play" :class="{ 'sy-cover-play-mini': compact }" :disabled="unplayable(item)" :aria-label="`${unplayable(item) ? '无法播放' : playing ? '暂停' : '播放'} ${item.exhibitTitle}`" @click="$emit('play', item)">
          <i v-if="unplayable(item)" class="freelog fl-icon-wufabofang" aria-hidden="true"></i>
          <i v-else-if="playing" class="freelog fl-icon-zanting" aria-hidden="true"></i>
          <img v-else-if="compact" class="sy-mini-play-icon" :src="themeAssets.miniPlay" alt="" />
          <template v-else>
            <img class="sy-cover-play-default" :src="themeAssets.coverPlay" alt="" />
            <img class="sy-cover-play-hover" :src="themeAssets.coverPlayHover" alt="" />
          </template>
        </button>
      </div>
    </div>
    <div v-if="!coverOnly" :class="{ 'sy-card-info': compact }">
      <div v-if="compact" class="sy-card-meta">
        <RouterLink v-if="parentLocation" class="sy-card-parent" :title="parentLabel" :to="parentLocation">{{ parentLabel }}</RouterLink>
        <small v-else class="sy-card-parent" :title="parentLabel">{{ parentLabel }}</small>
        <details ref="menu" class="sy-card-menu" @toggle="syncMenu" @keydown.esc.stop.prevent="escapeMenu">
          <summary ref="menuTrigger" :aria-label="`更多操作 ${item.exhibitTitle}`">
            <img class="sy-more-default" :src="themeAssets.cardMore" alt="" />
            <img class="sy-more-active" :src="themeAssets.cardMoreHover" alt="" />
          </summary>
          <div class="sy-card-menu-panel" @mouseleave="closeMenu">
            <button @click="share"><i class="freelog fl-icon-icon_fenxiang1" aria-hidden="true"></i><span>分享</span></button>
            <button @click="collect"><i class="freelog" :class="isCollected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'" aria-hidden="true"></i><span>{{ isCollected ? '取消收藏' : '收藏' }}</span></button>
          </div>
        </details>
      </div>
      <div :class="{ 'sy-card-text': compact }">
        <template v-if="collectionCard || isPodcast(item)">
          <div class="sy-card-title-row">
            <img v-if="item.articleInfo?.status === 2" class="sy-card-state" :src="freezeIcon" alt="封禁" />
            <span v-else-if="item.onlineStatus === 0" class="sy-card-offline">已下架</span>
            <img v-else-if="authAbnormal(item)" class="sy-card-state" :src="authErrorIcon" alt="授权链异常" />
            <button v-else-if="item.defaulterIdentityType === 4" class="sy-card-auth" :aria-label="`授权 ${item.exhibitTitle}`" title="未授权，点击授权" @click="$emit('authorize', item)"><i class="freelog fl-icon-suoding" aria-hidden="true"></i></button>
            <RouterLink class="sy-card-title" :to="detailLocation(item)" :title="item.exhibitTitle">{{ item.exhibitTitle }}</RouterLink>
          </div>
          <small v-if="metadata.author" class="sy-card-author" :title="metadata.author">{{ metadata.author }}</small>
          <small v-if="isPodcast(item) && !compact">{{ podcastSubtitle(item) }}</small>
          <p v-if="isPodcast(item) && mode === 'episode'" class="sy-description">{{ item.exhibitIntro }}</p>
        </template>
        <template v-else>
        <div class="sy-card-title-row">
        <button v-if="item.defaulterIdentityType === 4" class="sy-card-auth" :aria-label="`授权 ${item.exhibitTitle}`" title="未授权，点击授权" @click="$emit('authorize', item)"><i class="freelog fl-icon-suoding" aria-hidden="true"></i></button>
        <RouterLink
          class="sy-card-title"
          :to="detailLocation(item)"
          :title="item.exhibitTitle"
          >{{ item.exhibitTitle }}</RouterLink
        ></div><small v-if="mode !== 'episode'">{{
          isPodcast(item) ? podcastSubtitle(item) : item.subtitle || artist(item)
        }}</small>
        <p v-else class="sy-description">{{ item.exhibitIntro }}</p>
        </template>
      </div>
      <div
        v-if="compact"
        class="sy-card-actions"
      >
        <small>{{ duration(item) }}</small
        ><small v-if="mode === 'episode' && publishedTime" class="sy-published"
          >发布时间　{{ publishedTime }}</small>
      </div>
    </div>
  </article>
</template>
