<script setup lang="ts">
import { themeAssets } from "@/assets/theme";
import { computed, ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useGlobalStore } from '@/store/global';
import { secondsToHMS } from '@/utils/common';
import { musicDetailFields, musicDetailIntro, podcastDetailFields } from '@/utils/shengyu-detail';
import { artist, properties, entryCategory, entryKey, isCollection, authAbnormal, unplayable, type AudioEntry } from '@/api/shengyu';
import { authErrorIcon, freezeIcon } from '@/utils/status-icons';

import TrackName from './shengyu-track-name.vue';
import Card from './shengyu-card.vue';
import Actions from './shengyu-detail-actions.vue';
import PlayStatus from './play-status.vue';
import PodcastEpisode from './shengyu-podcast-episode.vue';
import '@/assets/css/shengyu-detail.css';
const props = defineProps<{ item: AudioEntry; tracks: AudioEntry[] }>();
const emit = defineEmits<{ play: [item: AudioEntry, startOnly?: boolean]; queue: [item: AudioEntry]; collect: [item: AudioEntry]; share: [item: AudioEntry]; authorize: [item: AudioEntry] }>();
const store = useGlobalStore();
const expanded = ref(false);
const infoElement = ref<HTMLElement>();
const tagsElement = ref<HTMLElement>();
const fieldsElement = ref<HTMLElement>();
const introElement = ref<HTMLElement>();
const visibleTags = ref(Infinity);
const tagsOverflow = ref(false);
const fieldsOverflow = ref(false);
const introOverflow = ref(false);
const hasOverflow = computed(() => tagsOverflow.value || fieldsOverflow.value || introOverflow.value);
let resizeObserver: ResizeObserver | undefined;
let measureFrame = 0;
let disposed = false;
function measureOverflow() {
  if (expanded.value || disposed) return;
  const tagList = tagsElement.value;
  if (tagList) {
    // Hidden tags retain measurable widths, so resizing can reveal them again.
    const widths = Array.from(tagList.querySelectorAll('a'), el => el.getBoundingClientRect().width);
    const gap = parseFloat(getComputedStyle(tagList).columnGap) || 0;
    const available = tagList.clientWidth;
    tagsOverflow.value = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, widths.length - 1) * gap > available + 1;
    let used = 0, count = 0;
    const markerWidth = tagList.querySelector<HTMLElement>('.sy-music-tags-more')?.getBoundingClientRect().width || 10;
    for (const width of widths) {
      const next = used + (count ? gap : 0) + width;
      if (tagsOverflow.value && next + gap + markerWidth > available + 1) break;
      used = next;
      count++;
    }
    visibleTags.value = count;
  } else {
    tagsOverflow.value = false;
    visibleTags.value = Infinity;
  }
  fieldsOverflow.value = !!fieldsElement.value && fieldsElement.value.scrollHeight > fieldsElement.value.clientHeight + 1;
  introOverflow.value = !!introElement.value && introElement.value.scrollHeight > introElement.value.clientHeight + 1;
}
function scheduleMeasure() {
  cancelAnimationFrame(measureFrame);
  measureFrame = requestAnimationFrame(measureOverflow);
}
const category = computed(() => entryCategory(props.item));
const collection = computed(() => isCollection(props.item));
const album = computed(() => category.value === 'albums');
const podcast = computed(() => category.value === 'podcasts');
const tags = computed<string[]>(() => (props.item.itemId ? props.item.articleInfo?.articleTags : props.item.tags || props.item.articleInfo?.articleTags) || []);
const intro = computed(() => musicDetailIntro(props.item));
const albumName = computed(() => props.item.itemId ? props.item.albumName : properties(props.item).album_name || props.item.albumName);
function time(item: AudioEntry) {
  const value = item.duration || properties(item).duration || properties(item).collection_duration;
  if (!value) return '--:--';
  return String(value).includes(':') ? String(value) : secondsToHMS(Number(value));
}
const fields = computed(() => {
  if (podcast.value) return podcastDetailFields(props.item);
  const values = musicDetailFields(props.item, store.nodeInfo.ownerUserName);
  if (collection.value) return values;
  const order = ['资源类型', '艺人', '发行时间', '时长', '厂牌', '语种', '风格'];
  return values.sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));
});
const isCurrent = (item: AudioEntry) => store.playingInfo && entryKey(store.playingInfo) === entryKey(item);
watch(() => entryKey(props.item), () => { expanded.value = false; });
watch([tags, fields, intro, expanded], async () => { await nextTick(); scheduleMeasure(); }, { flush: 'post', deep: true });
onMounted(() => {
  resizeObserver = new ResizeObserver(scheduleMeasure);
  if (infoElement.value) resizeObserver.observe(infoElement.value);
  scheduleMeasure();
  document.fonts?.ready.then(() => { if (!disposed) scheduleMeasure(); });
});
onBeforeUnmount(() => {
  disposed = true;
  resizeObserver?.disconnect();
  cancelAnimationFrame(measureFrame);
});
</script>
<template>
  <div class="sy-music-detail" :class="{ 'is-album': album, 'is-podcast': podcast, 'is-song': !collection, 'is-collection': collection, expanded }">
    <section class="sy-music-hero">
      <Card v-if="album" class="sy-music-art with-disc" mode="album" cover-only :item="item" @play="emit('play', $event)" />
      <Card v-else-if="!collection || podcast" class="sy-music-art" :class="{ 'sy-song-art': !collection }" cover-only :item="item" @play="emit('play', $event)" />
      <div v-else class="sy-music-art">
        <img class="sy-music-cover" :src="item.coverImages?.[0] || themeAssets.defaultCover" :alt="item.exhibitTitle" />
      </div>
      <div ref="infoElement" class="sy-music-info">
        <div v-if="collection || podcast || item.defaulterIdentityType === 4" class="sy-music-badges">
          <img v-if="podcast && item.articleInfo?.status === 2" class="sy-podcast-detail-state" :src="freezeIcon" alt="封禁" />
          <span v-else-if="podcast && item.onlineStatus === 0">已下架</span>
          <img v-else-if="podcast && authAbnormal(item)" class="sy-podcast-detail-state" :src="authErrorIcon" alt="授权链异常" title="授权链异常" />
          <button v-else-if="item.defaulterIdentityType === 4" class="sy-music-lock" title="授权并播放" aria-label="授权并播放" @click="emit('play', item)"><img :src="themeAssets.lock" alt="待授权" /></button>
          <span v-if="collection || podcast" class="sy-music-badge">{{ podcast ? (collection ? '播客' : '单集') : album ? '专辑' : '歌单' }}</span>
        </div>
        <h1 :title="item.exhibitTitle">{{ item.exhibitTitle }}</h1>
        <p v-if="!collection && albumName" class="sy-music-origin">收录于{{ podcast ? '专辑' : String(item.parentResourceType).includes('歌单') ? '歌单' : '专辑' }} <RouterLink v-if="item.itemId" :to="{ path: '/detail', query: { id: item.exhibitId } }">{{ albumName }}</RouterLink><span v-else>{{ albumName }}</span></p>
        <div v-if="tags.length" ref="tagsElement" class="sy-music-tags">
          <RouterLink v-for="(tag, index) in tags" :key="`${index}-${tag}`" :class="{ 'sy-tag-hidden': !expanded && index >= visibleTags }" :tabindex="!expanded && index >= visibleTags ? -1 : undefined" :aria-hidden="!expanded && index >= visibleTags ? true : undefined" :to="{ path: '/search-list', query: { q: tag } }">{{ tag }}</RouterLink>
          <button v-if="podcast && !collection && tagsOverflow && !expanded" class="sy-music-tags-more sy-podcast-tags-expand" aria-label="展开全部标签" @click="expanded = true">...</button>
          <span v-else class="sy-music-tags-more" :class="{ 'is-hidden': expanded || !tagsOverflow }" aria-hidden="true">...</span>
        </div>
        <div v-if="fields.length" class="sy-music-properties-wrap">
          <dl ref="fieldsElement" class="sy-music-properties"><div v-for="[label, value] in fields" :key="label" :data-field="label" :title="`${label}：${value}`"><dt>{{ label }}：</dt><dd>{{ value }}</dd></div></dl>
          <span v-if="!expanded && fieldsOverflow" class="sy-music-properties-more" aria-hidden="true">...</span>
        </div>
        <p v-if="collection && intro" ref="introElement" class="sy-music-intro">{{ intro }}</p>
        <button v-if="!expanded && hasOverflow && !(podcast && !collection)" class="sy-music-expand" :aria-expanded="expanded" @click="expanded = true">更多信息</button>
        <Actions v-if="!collection" :item="item" @play="emit('play', $event)" @queue="emit('queue', $event)" @collect="emit('collect', $event)" @share="emit('share', $event)" />
      </div>
    </section>
    <section v-if="collection" class="sy-music-tracks">
      <div class="sy-music-track-heading"><h2>{{ podcast ? '单集' : '包含音乐' }}（{{ tracks.length }}）</h2><Actions :item="item" @play="emit('play', $event, true)" @queue="emit('queue', $event)" @collect="emit('collect', $event)" @share="emit('share', $event)" /></div>
      <div v-if="podcast" class="sy-podcast-episodes" aria-label="单集">
        <PodcastEpisode v-for="track in tracks" :key="entryKey(track)" :item="track" @play="emit('play', $event)" @collect="emit('collect', $event)" @share="emit('share', $event)" @authorize="emit('authorize', $event)" />
      </div>
      <div v-else class="sy-track-table" role="table" aria-label="包含音乐" :class="{ 'with-metadata': !album }">
        <div class="sy-track-header" role="row"><span class="sy-track-name" role="columnheader"><span>封面</span><span>歌曲</span></span><span aria-hidden="true"></span><span v-if="!album" role="columnheader">艺人</span><span v-if="!album" role="columnheader">专辑</span><span class="sy-track-time" role="columnheader">时长</span></div>
        <div v-for="track in tracks" :key="entryKey(track)" class="sy-track-row" role="row" :class="{ unavailable: unplayable(track) }">
          <TrackName :item="track" @authorize="emit('authorize', $event)" />
          <Actions compact :item="track" @play="emit('play', $event)" @queue="emit('queue', $event)" @collect="emit('collect', $event)" @share="emit('share', $event)" />
          <span v-if="!album" class="sy-track-metadata" role="cell" :title="artist(track)">{{ artist(track) || '未知' }}</span>
          <span v-if="!album" class="sy-track-metadata" role="cell" :title="properties(track).album_name || track.albumName">{{ properties(track).album_name || track.albumName || '未知' }}</span>
          <span class="sy-track-time" role="cell"><PlayStatus v-if="isCurrent(track)" :playing="store.playing" :status-text="false" color="var(--sy-brand)" /><template v-else>{{ time(track) === '--:--' ? '00:00' : time(track) }}</template></span>
        </div>
      </div>
      <p v-if="!tracks.length" class="sy-status">{{ podcast ? '暂无单集' : '暂无音乐' }}</p>
    </section>
    <p v-else-if="intro" class="sy-song-intro">{{ intro }}</p>
  </div>
</template>
