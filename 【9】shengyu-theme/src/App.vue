<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useGlobalStore } from "@/store/global";
import Share from "@/components/share.vue";
import Player from "@/components/player-v2.vue";
import FloatingTools from "@/components/shengyu-floating-tools.vue";
import Search from "@/components/shengyu-search.vue";
import Account from "@/components/shengyu-account.vue";
import { freelogEntrances } from "@/api/data";
import { currentTheme, observeTheme } from "@/utils/theme-manager";

import "@/assets/css/theme.less";
import "@/assets/css/index.less";
import "@/assets/css/shengyu.css";
const store = useGlobalStore(),
  route = useRoute();
const nodeLogo = computed(() => store.nodeInfo.nodeLogo || '');
const brandStyle = computed(() => {
  const value = store.selfConfig?.options_theme_color;
  if (typeof value !== 'string') return {};
  const color = value.trim();
  // Console colors use hexadecimal RGB; ignore missing or invalid configuration.
  if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color)) return {};
  const hex = color.length === 4
    ? color.slice(1).split('').map(character => character.repeat(2)).join('')
    : color.slice(1);
  const channels = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
  return {
    '--sy-config-brand': color,
    '--sy-config-brand-soft': `rgba(${channels.map(channel => Math.round(channel * .65 + 255 * .35)).join(', ')}, 0.5)`,
  };
});
const musicPath = ref('/voice-list');
watch(() => route.path, path => {
  if (['/voice-list', '/album-list', '/play-list'].includes(path)) musicPath.value = path;
}, { immediate: true });
const links = [
  ["首页", "/home"],
  ["音乐", "/voice-list"],
  ["播客", "/podcast-list"],
  ["收藏", "/collection-list"],
];
const isActive = (path: string) =>
  path === route.path ||
  (path === "/voice-list" &&
    ["/album-list", "/play-list"].includes(route.path));
let stopTheme = () => {};
function resize() {
  store.inMobile = window.innerWidth < 768;
}
onMounted(() => {
  resize();
  window.addEventListener("resize", resize);
  stopTheme = observeTheme();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
  stopTheme();
});
</script>
<template>
  <div
    class="sy-app"
    id="music-theme"
    :data-theme="currentTheme"
    :style="brandStyle"
    :class="{ mobile: store.inMobile, pc: !store.inMobile }"
  >
    <header class="sy-header">
      <div class="sy-container sy-header-inner">
        <RouterLink v-if="nodeLogo" to="/home" class="sy-logo-link" aria-label="声屿首页"
          ><img
            class="sy-logo"
            :src="nodeLogo"
            alt="声屿"
        /></RouterLink>
        <div class="sy-header-actions">
        <nav class="sy-nav" aria-label="主导航">
          <RouterLink
            v-for="[label, path] in links"
            :key="path"
            :to="path === '/voice-list' ? musicPath : path"
            :class="{ active: isActive(path) }"
            :aria-current="isActive(path) ? 'page' : undefined"
            >{{ label }}</RouterLink
          >
        </nav>
        <Search />
        <Account />
        </div>
      </div>
    </header>
    <main class="sy-container sy-main" :class="{ 'sy-library-main': ['/search-list', '/collection-list', '/signed-list'].includes(route.path) }">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <KeepAlive :max="10">
          <component v-if="currentRoute.meta.keepAlive" :is="Component" :key="currentRoute.fullPath" />
        </KeepAlive>
        <component v-if="!currentRoute.meta.keepAlive" :is="Component" :key="currentRoute.fullPath" />
      </RouterView>
    </main>
    <footer class="sy-footer">
      <a
        v-for="(item, index) in freelogEntrances"
        :key="item.label"
        :href="item.url"
        :aria-label="index === 0 ? 'Freelog 官网' : item.label"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i v-if="index === 0" :class="item.label" aria-hidden="true" />
        <span v-else>{{ item.label }}</span>
      </a>
    </footer>
    <FloatingTools />
    <Player />
    <Share />
  </div>
</template>
