<script setup lang="ts">
import { useGlobalStore } from "@/store/global";
import { artist, properties, duration, entryKey, unplayable, type AudioEntry } from "@/api/shengyu";
import TrackName from "./shengyu-track-name.vue";
import Actions from "./shengyu-detail-actions.vue";
import PlayStatus from "./play-status.vue";
import "@/assets/css/shengyu-detail.css";

defineProps<{ items: AudioEntry[] }>();
defineEmits<{
  play: [item: AudioEntry];
  queue: [item: AudioEntry];
  collect: [item: AudioEntry];
  share: [item: AudioEntry];
  authorize: [item: AudioEntry];
}>();
const store = useGlobalStore();
const albumName = (item: AudioEntry) => properties(item).album_name || item.albumName || "未知";
const albumLocation = (item: AudioEntry) =>
  item.itemId && String(item.parentResourceType).includes("音乐专辑")
    ? { path: "/detail", query: { id: item.exhibitId } }
    : undefined;
const isCurrent = (item: AudioEntry) =>
  store.playingInfo && entryKey(store.playingInfo) === entryKey(item);
</script>

<template>
  <div
    class="sy-track-table with-metadata sy-music-list"
    role="table"
    aria-label="音乐列表"
  >
    <div class="sy-track-header" role="row">
      <span class="sy-track-name" role="columnheader"><span>封面</span><span>歌曲</span></span>
      <span aria-hidden="true"></span><span role="columnheader">艺人</span
      ><span role="columnheader">专辑</span
      ><span class="sy-track-time" role="columnheader">时长</span>
    </div>
    <div
      v-for="item in items"
      :key="entryKey(item)"
      class="sy-track-row"
      role="row"
      :class="{ unavailable: unplayable(item) }"
      :title="unplayable(item) ? '无法播放' : undefined"
    >
      <TrackName :item="item" @authorize="$emit('authorize', $event)" />
      <Actions
        compact
        :item="item"
        @play="$emit('play', $event)"
        @queue="$emit('queue', $event)"
        @collect="$emit('collect', $event)"
        @share="$emit('share', $event)"
      />
      <span class="sy-track-metadata" role="cell" :title="artist(item)">{{
        artist(item) || "未知"
      }}</span>
      <RouterLink
        v-if="albumLocation(item)"
        class="sy-track-metadata sy-track-album"
        role="cell"
        :to="albumLocation(item)!"
        :title="albumName(item)"
        >{{ albumName(item) }}</RouterLink
      >
      <span v-else class="sy-track-metadata" role="cell" :title="albumName(item)">{{
        albumName(item)
      }}</span>
      <span class="sy-track-time" role="cell"
        ><PlayStatus
          v-if="isCurrent(item)"
          :playing="store.playing"
          :status-text="false"
          color="var(--sy-brand)"
        /><template v-else>{{
          duration(item) === "--:--" ? "00:00" : duration(item)
        }}</template></span
      >
    </div>
  </div>
</template>

<style scoped>
.sy-music-list.with-metadata .sy-track-header,
.sy-music-list.with-metadata .sy-track-row {
  grid-template-columns: minmax(0, 460fr) 140px minmax(0, 200fr) minmax(0, 200fr) 100px;
  gap: 30px;
}
.sy-music-list .sy-track-row {
  height: 70px;
}
.sy-music-list .sy-track-row:hover,
.sy-music-list .sy-track-row:focus-within {
  background: var(--sy-hover);
}
.sy-music-list a.sy-track-name:hover > span,
.sy-music-list .sy-track-album:hover {
  color: var(--sy-brand);
  text-decoration: underline;
  text-underline-position: under;
}
@media (max-width: 1000px) {
  .sy-music-list.with-metadata .sy-track-header,
  .sy-music-list.with-metadata .sy-track-row {
    grid-template-columns: minmax(150px, 1fr) 110px minmax(70px, 0.5fr) minmax(70px, 0.5fr) 65px;
    gap: 10px;
  }
}
@media (max-width: 700px) {
  .sy-music-list.with-metadata .sy-track-header,
  .sy-music-list.with-metadata .sy-track-row {
    grid-template-columns: minmax(0, 1fr) 65px;
    gap: 10px;
  }
  .sy-music-list .sy-track-row {
    height: auto;
  }
}
</style>
