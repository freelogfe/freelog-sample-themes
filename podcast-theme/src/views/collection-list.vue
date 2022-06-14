<template>
  <div class="collect-list-wrapper">
    <list
      :list="$store.state.collectionList"
      :loading="!$store.state.collectionList"
      title="收藏"
      noDataTip="暂无任何收藏"
      statusShow
    />
  </div>
</template>

<script>
import list from "@/components/list";

export default {
  name: "collect-list",

  components: { list },

  activated() {
    const { routerMode } = this.$store.state;
    if (routerMode === 1) {
      app.scroll({ top: 0 });
      sessionStorage.setItem("collectionListScroll", 0);
    } else if (routerMode === 2) {
      const scrollTop = sessionStorage.getItem("collectionListScroll") || 0;
      app.scroll({ top: scrollTop });
    }
    app.addEventListener("scroll", this.scroll);
  },

  deactivated() {
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 页面滚动 */
    scroll() {
      const scrollTop = app.scrollTop || 0;
      sessionStorage.setItem("collectionListScroll", scrollTop);
    },
  },
};
</script>
