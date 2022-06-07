<template>
  <div id="app" @scroll="updateScroll()">
    <div class="page-wrapper">
      <my-header />
      <router-view class="router-view" />
      <my-footer />
    </div>
    <my-player />
    <theme-entrance />
    <share />
    <div
      class="scroll-bar"
      :style="{
        height: `${(clientHeight / pageHeight) * 100}%`,
        top: `${(scrollTop / pageHeight) * 100}%`,
      }"
      v-show="pageHeight > clientHeight"
    ></div>
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

  data() {
    return {
      clientHeight: 0,
      pageHeight: 0,
      scrollTop: 0,
    };
  },

  mounted() {
    this.clientHeight = document.body.clientHeight;
    const page = document.getElementsByClassName("page-wrapper")[0];
    page.addEventListener("DOMNodeInserted", () => {
      this.pageHeight = page.clientHeight;
    });
    page.addEventListener("DOMNodeRemoved", () => {
      this.pageHeight = page.clientHeight;
    });
  },

  methods: {
    updateScroll() {
      this.scrollTop = app.scrollTop;
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/css";

#app {
  background-color: #222;
  color: #fff;
  font-size: 14px;

  &:hover {
    .scroll-bar {
      opacity: 1;
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
      width: 1130px;
      flex: 1;
      animation: fade-in 0.5s ease;
    }
  }

  &::-webkit-scrollbar {
    width: 0;
  }

  .scroll-bar {
    position: fixed;
    right: 0;
    top: 0;
    width: 5px;
    height: 100px;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.3);
    opacity: 0;
    transition: opacity 0.3s linear;
    z-index: 102;
  }
}
</style>
