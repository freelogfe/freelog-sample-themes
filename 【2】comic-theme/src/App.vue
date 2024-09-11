<template>
  <div v-if="!maskLoading">
    <router-view v-slot="{ Component }">
      <keep-alive include="home">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <div id="modal"></div>
  </div>
  <div style="width: 100vw; height: 100vh" v-loading="maskLoading" v-else></div>
</template>

<script lang="ts">
import { toRefs } from "vue";
import { useStore } from "vuex";
import { State } from "@/store/index";

export default {
  setup() {
    const store = useStore<State>();

    return {
      ...toRefs(store.state)
    };
  }
};
</script>

<style lang="scss">
@import "@/assets/css";
</style>
