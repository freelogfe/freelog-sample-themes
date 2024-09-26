<template>
  <my-header />
  <router-view v-slot="{ Component }">
    <keep-alive include="home">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <my-footer />
  <theme-entrance />
  <login-btn />
  <div id="modal"></div>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";
import { widgetApi } from 'freelog-runtime';

export default {
  components: {
    "my-header": defineAsyncComponent(() => import("./components/header.vue")),
    "theme-entrance": defineAsyncComponent(() => import("./components/theme-entrance.vue")),
    "login-btn": defineAsyncComponent(() => import("./components/login-btn.vue")),
    "my-footer": defineAsyncComponent(() => import("./components/footer.vue")),
  },
  setup() {
    const themeInfo = widgetApi.getData()?.themeInfo;
    console.log("当前应用版本为:", themeInfo?.version, "+++");
    return {}
  }
};
</script>

<style lang="scss">
@import "@/assets/css";
</style>
