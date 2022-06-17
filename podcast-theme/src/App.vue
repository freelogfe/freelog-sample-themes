<template>
  <div id="app" :class="{ pc: $store.state.inMobile === false, mobile: $store.state.inMobile }">
    <div class="page-wrapper">
      <my-header />
      <keep-alive>
        <router-view class="router-view" />
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

  &.pc {
    .page-wrapper {
      padding-bottom: 48px;

      .router-view {
        width: 1130px !important;
      }
    }

    &::-webkit-scrollbar {
      width: 5px;
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      width: 5px;
      border-radius: 5px;
      background-color: rgba(255, 255, 255, 0.3);
    }
  }

  &.mobile .page-wrapper {
    padding-bottom: 178px;
    
    .router-view {
      width: 100%;
    }
  }

  .page-wrapper {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;

    .router-view {
      flex: 1;
      animation: fade-in 0.5s ease;
    }
  }
}
</style>
