<script setup lang="ts">
import { useGlobalStore } from "@/store/global";

import HomeBanner from "./home-banner.vue";

const store = useGlobalStore();
const { increment } = store;

const handleClick = () => {
  increment();
};
</script>

<template>
  <HomeBanner />
  <div>主页{{ store.doubleCount }}</div>
  <button @click="handleClick">增加</button>
</template>
