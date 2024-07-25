<script setup lang="ts">
import { useGlobalStore } from "@/store/global";

import HomeBanner from "./home-banner.vue";
import HomePopular from "./home-popular.vue";
import HomeAlbum from "./home-album.vue";

const store = useGlobalStore();
</script>

<template>
  <HomeBanner />
  <HomePopular />
  <HomeAlbum />
</template>
