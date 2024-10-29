<template>
  <div v-if="!maskLoading">
    <my-header />
    <div class="app-wrapper" :class="{ inMobile: inMobile }">
      <router-view v-slot="{ Component }">
        <keep-alive include="home">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <my-footer />
    <theme-entrance />
    <login-btn />
    <div id="modal"></div>
  </div>
  <div class="maskLoading" v-else>
    <span class="freelog fl-icon-loading"></span>
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { widgetApi } from 'freelog-runtime';
import { useStore } from "vuex"

export default {
  components: {
    "my-header": defineAsyncComponent(() => import("./components/header.vue")),
    "theme-entrance": defineAsyncComponent(() => import("./components/theme-entrance.vue")),
    "login-btn": defineAsyncComponent(() => import("./components/login-btn.vue")),
    "my-footer": defineAsyncComponent(() => import("./components/footer.vue")),
  },
  setup() {
    const store = useStore()

    const maskLoading = computed(() => {
      return store.state.maskLoading
    })

    const inMobile = computed(() => {
      return store.state.inMobile
    })

    const themeInfo = widgetApi.getData()?.themeInfo;
    console.log("当前应用版本为:", themeInfo?.version, "+++");

    return {
      maskLoading,
      inMobile
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/css";

.app-wrapper {
  min-height: calc(100vh - 148px);

  &.inMobile {
    min-height: calc(100vh - 158px);
  }
}

.maskLoading {
  width: 100vw;
  height: 100vh;
  display: flex; 
  justify-content: center; 
  align-items: center;
  background-image: linear-gradient(rgba(0, 0, 0, 0.8) 30%, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
  span {
    color: rgba(255, 255, 255, 0.6);
    animation: loading 1s linear infinite;
  }
}

@keyframes loading {
  from {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(180deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
