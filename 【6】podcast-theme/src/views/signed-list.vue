<!-- 签约列表页 -->

<template>
  <div class="sign-list-wrapper">
    <list
      :list="$store.state.signedList"
      :loading="loading"
      title="签约记录"
      noDataTip="暂无任何签约记录"
      statusShow
      authShow
      noMoreTip="已经加载全部数据"
      :total="$store.state.signedList ? $store.state.signedList.length : 0"
    />
  </div>
</template>

<script>
import list from "@/components/list";

export default {
  name: "sign-list",

  components: { list },

  data() {
    return {
      loading: false
    }
  },

  created() {
    this.loading = true
    setTimeout(() => {
      if (!this.$store.state.signedList) {
        setInterval(() => {
          if (this.$store.state.signedList) {
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
      sessionStorage.setItem("signedListScroll", 0);
    } else if (routerMode === 2) {
      // back 过来，滚动条回到之前位置
      const scrollTop = sessionStorage.getItem("signedListScroll") || 0;
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
      sessionStorage.setItem("signedListScroll", scrollTop);
    }
  }
};
</script>
