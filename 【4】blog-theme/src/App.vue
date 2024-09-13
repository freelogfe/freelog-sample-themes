<template>
  <my-header :mobileSearching="inMobile" />
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

export default {
  components: {
    "my-header": defineAsyncComponent(() => import("./components/header.vue")),
    "theme-entrance": defineAsyncComponent(() => import("./components/theme-entrance.vue")),
    "login-btn": defineAsyncComponent(() => import("./components/login-btn.vue")),
    "my-footer": defineAsyncComponent(() => import("./components/footer.vue")),
  }
};
</script>

<style lang="scss">
@import "@/assets/css";
</style>
