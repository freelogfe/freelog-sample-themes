<template>
  <div class="sign-list-wrapper">
    <list
      :list="$store.state.signedList"
      :loading="!$store.state.signedList"
      title="签约记录"
      noDataTip="暂无任何签约记录"
      statusShow
      authShow
    />
  </div>
</template>

<script>
import list from "@/components/list";

export default {
  name: "sign-list",

  components: { list },

  activated() {
    const { routerMode } = this.$store.state;
    if (routerMode === 1) {
      app.scroll({ top: 0 });
      sessionStorage.setItem("signedListScroll", 0);
    } else if (routerMode === 2) {
      const scrollTop = sessionStorage.getItem("signedListScroll") || 0;
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
      sessionStorage.setItem("signedListScroll", scrollTop);
    },
  },
};
</script>
