<template>
  <div id="app">
    <div class="page-wrapper">
      <my-header />
      <keep-alive>
        <router-view class="router-view" :class="{ mobile: $store.state.inMobile }" />
      </keep-alive>
      <my-footer />
    </div>
    <my-player />
    <theme-entrance />
    <share />
  </div>
</template>

<script>
import myHeader from "@/components/header";
import myFooter from "@/components/footer";
import myPlayer from "@/components/player";
import themeEntrance from "@/components/theme-entrance";
import share from "@/components/share";

export default {
  components: {
    myHeader,
    myFooter,
    myPlayer,
    themeEntrance,
    share,
  },

  created() {
    this.$router.afterEach((to) => {
      // 将第一个路由记入路由历史
      const { locationHistory } = this.$store.state;
      if (locationHistory.length) return;

      const { path, query } = to;
      locationHistory.push(JSON.stringify({ path, query }));
      this.$store.commit("setData", { key: "locationHistory", value: locationHistory });
      this.$store.commit("setData", { key: "routerMode", value: 1 });
    });
  },
};
</script>

<style lang="scss">
@import "@/assets/css";

#app {
  background-color: #222;
  color: #fff;
  font-size: 14px;

  &::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    width: 5px;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.3);
  }

  .page-wrapper {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;

    .router-view {
      width: 1130px;
      flex: 1;
      animation: fade-in 0.5s ease;

      &.mobile {
        width: 100%;
      }
    }
  }
}
</style>
