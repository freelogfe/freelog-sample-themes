<!-- 收藏列表页 -->

<template>
  <div class="collect-list-wrapper">
    <list
      :list="$store.state.collectionList"
      :loading="loading"
      title="收藏"
      noDataTip="暂无任何收藏"
      statusShow
      noMoreTip="已经加载全部数据"
      :total="$store.state.collectionList && $store.state.collectionList.length"
    />
  </div>
</template>

<script>
import list from "@/components/list-v2";

export default {
  name: "collect-list",

  components: { list },

  data() {
    return {
      loading: false
    }
  },

  created() {
    this.loading = true
    setTimeout(() => {
      if (!this.$store.state.collectionList) {
        setInterval(() => {
          if (this.$store.state.collectionList) {
            this.loading = false
          }
        }, 200)
      } else {
        this.loading = false
      }
    }, 800)
  },

  activated() {
    const app = document.getElementById("appPodcast");
    const { routerMode } = this.$store.state;
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
    const app = document.getElementById("appPodcast");
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 页面滚动 */
    scroll() {
      const app = document.getElementById("appPodcast");
      const scrollTop = app.scrollTop || 0;
      sessionStorage.setItem("collectionListScroll", scrollTop);
    }, 
  }
};
</script>
