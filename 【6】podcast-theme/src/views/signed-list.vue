<!-- 签约列表页 -->

<template>
  <div class="sign-list-wrapper">
    <list
      :list="$store.state.signedList"
      :loading="!$store.state.signedList"
      title="签约记录"
      noDataTip="暂无任何签约记录"
      statusShow
      authShow
      noMoreTip="已经加载全部数据"
      :total="$store.state.signedList.length"
    />
  </div>
</template>

<script>
import list from "@/components/list";

export default {
  name: "sign-list",

  components: { list },

  activated() {
    const app = document.getElementById("app");
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
    const app = document.getElementById("app");
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 页面滚动 */
    scroll() {
      const scrollTop = app.scrollTop || 0;
      sessionStorage.setItem("signedListScroll", scrollTop);
    }
  }
};
</script>
