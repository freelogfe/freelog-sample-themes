<!-- 收藏列表页 -->
<template>
  <div class="collect-list-wrapper">
    <list
      :list="store.collectionList"
      :loading="!store.collectionList"
      title="收藏"
      noDataTip="暂无任何收藏"
      statusShow
    />
  </div>
</template>

<script>
import { useGlobalStore } from "@/store/global";
import list from "@/components/list.vue";

export default {
  name: "collect-list",

  components: { list },

  data() {
    const store = useGlobalStore();

    return {
      store
    };
  },

  activated() {
    const app = document.getElementById("app");
    const { routerMode } = this.store;
    if (routerMode === 1) {
      // push 过来，滚动条回到顶部
      app.scroll({ top: 0 });
      sessionStorage.setItem("collectionListScroll", 0);
    } else if (routerMode === 2) {
      // back 过来，滚动条回到之前位置
      const scrollTop = sessionStorage.getItem("collectionListScroll") || 0;
      app.scroll({ top: scrollTop });
    }
    app.addEventListener("scroll", this.scroll);
  },

  deactivated() {
    const app = document.getElementById("app");
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 页面滚动 */
    scroll() {
      const app = document.getElementById("app");
      const scrollTop = app.scrollTop || 0;
      sessionStorage.setItem("collectionListScroll", scrollTop);
    }
  }
};
</script>

<style lang="less">
.collect-list-wrapper {
  .album-wrap {
    padding: 0 !important;
  }
}
</style>
