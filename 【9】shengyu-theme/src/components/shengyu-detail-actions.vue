<script setup lang="ts">
import { themeAssets } from "@/assets/theme";
import { computed } from 'vue';
import { useGlobalStore } from '@/store/global';
import { useMyCollection, useMyPlay } from '@/utils/hooks';
import { entryKey, isCollection, unplayable, type AudioEntry } from '@/api/shengyu';
const props = defineProps<{ item: AudioEntry; compact?: boolean }>();
defineEmits<{ play: [item: AudioEntry]; queue: [item: AudioEntry]; collect: [item: AudioEntry]; share: [item: AudioEntry] }>();
const store = useGlobalStore();
const collected = computed(() => useMyCollection.ifExist(props.item));
const queued = computed(() => !isCollection(props.item) && useMyPlay.ifExist(props.item));
const playing = computed(() => (props.compact || !isCollection(props.item)) && store.playing && store.playingInfo && (isCollection(props.item)
  ? store.playingInfo.exhibitId === props.item.exhibitId
  : entryKey(store.playingInfo) === entryKey(props.item)));
</script>
<template>
  <div class="sy-music-actions" :class="{ compact }">
    <button class="sy-music-action sy-music-play" :disabled="unplayable(item)" :title="unplayable(item) ? '无法播放' : playing ? '暂停' : isCollection(item) ? '播放全部' : '播放'" :aria-label="unplayable(item) ? `无法播放 ${item.exhibitTitle}` : playing ? '暂停' : isCollection(item) ? '播放全部' : `播放 ${item.exhibitTitle}`" @click="$emit('play', item)">
      <i v-if="unplayable(item)" class="freelog fl-icon-wufabofang" aria-hidden="true"></i>
      <i v-else-if="playing" class="freelog fl-icon-zanting-daibiankuang" aria-hidden="true"></i>
      <template v-else>
        <img class="sy-action-default" :src="compact ? themeAssets.listPlay : themeAssets.play" alt="" />
        <img v-if="compact" class="sy-action-hover" :src="themeAssets.listPlayHover" alt="" />
      </template>
      <span v-if="!compact">{{ unplayable(item) ? '无法播放' : playing ? '暂停' : isCollection(item) ? '播放全部' : '播放' }}</span>
    </button>
    <button class="sy-music-action sy-music-secondary" :title="queued ? '已在播放列表' : '加入播放列表'" aria-label="加入播放列表" :disabled="unplayable(item) || queued" @click="$emit('queue', item)">
      <img class="sy-action-default" :src="compact ? themeAssets.listQueue : themeAssets.queue" alt="" />
      <img v-if="compact" class="sy-action-hover" :src="themeAssets.listQueueHover" alt="" />
      <span v-if="!compact">加入播放列表</span>
    </button>
    <button class="sy-music-action sy-music-secondary" :title="collected ? '取消收藏' : '收藏'" :aria-label="collected ? '取消收藏' : '收藏'" :aria-pressed="collected" @click="$emit('collect', item)">
      <i v-if="collected" class="freelog fl-icon-shoucangxiaoshuoyishoucang" aria-hidden="true"></i>
      <template v-else>
        <img class="sy-action-default" :src="compact ? themeAssets.listCollect : themeAssets.collect" alt="" />
        <img v-if="compact" class="sy-action-hover" :src="themeAssets.listCollectHover" alt="" />
      </template>
      <span v-if="!compact">{{ collected ? '取消收藏' : '收藏' }}</span>
    </button>
    <button class="sy-music-action sy-music-secondary" title="分享" aria-label="分享" @click="$emit('share', item)">
      <img class="sy-action-default" :src="compact ? themeAssets.listShare : themeAssets.share" alt="" />
      <img v-if="compact" class="sy-action-hover" :src="themeAssets.listShareHover" alt="" />
      <span v-if="!compact">分享</span>
    </button>
  </div>
</template>
