<template>
  <router-view v-slot="{ Component }">
    <keep-alive include="home">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <theme-entrance />
  <login-btn />
  <div id="modal"></div>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";

export default {
  components: {
    "theme-entrance": defineAsyncComponent(() => import("./components/theme-entrance.vue")),
    "login-btn": defineAsyncComponent(() => import("./components/login-btn.vue")),
  },
};
</script>

<style lang="scss">
@import "@/assets/css";
</style>
