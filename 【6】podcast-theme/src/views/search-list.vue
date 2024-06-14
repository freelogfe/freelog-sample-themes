<!-- 搜索列表页 -->

<template>
  <div class="search-list-wrapper">
    <list
      :list="listData"
      :loading="loading"
      :total="total"
      :searchTitle="
        $store.state.inMobile
          ? total
            ? `查询到${total}个相关结果`
            : ''
          : `“${keywords}”的搜索结果${total ? '（' + total + '）' : ''}`
      "
      noMoreTip="已加载全部"
      noDataTip="搜索无结果"
    />
  </div>
</template>

<script>
import list from "@/components/list";
import { freelogApp } from "freelog-runtime";

export default {
  name: "search-list",

  components: {
    list,
  },

  data() {
    return {
      keywords: "",
      listData: [],
      loading: false,
      myLoading: false,
      total: 0,
    };
  },

  watch: {
    "$store.state.authIdList"(cur) {
      cur.forEach((id) => {
        const item = this.listData.find((data) => data.exhibitId === id);
        item.defaulterIdentityType = 0;
      });
    },

    "$store.state.searchKey": {
      handler(cur) {
        if (cur === this.keywords) return;

        this.keywords = cur;
        this.getList(true);
      },
      immediate: true,
    },
  },

  created() {
    this.getList(true);
  },

  activated() {
    const app = document.getElementById("app");
    const { routerMode } = this.$store.state;
    if (routerMode === 1) {
      // push 过来，滚动条回到顶部
      app.scroll({ top: 0 });
      sessionStorage.setItem("searchListScroll", 0);
    } else if (routerMode === 2) {
      // back 过来，滚动条回到之前位置
      const scrollTop = sessionStorage.getItem("searchListScroll") || 0;
      app.scroll({ top: scrollTop });
    }
    app.addEventListener("scroll", this.scroll);
  },

  deactivated() {
    const app = document.getElementById("app");
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 获取声音列表 */
    async getList(init = false) {
      if (this.myLoading) return;
      if (this.total === this.listData.length && !init) return;

      if (init) {
        this.total = 0;
        this.loading = true;
      }
      this.myLoading = true;
      this.skip = init ? 0 : this.skip + 20;
      const queryParams = {
        skip: this.skip,
        articleResourceTypes: "音频",
        isLoadVersionProperty: 1,
        limit: 20,
        keywords: this.keywords,
      };
      const list = await freelogApp.getExhibitListByPaging(queryParams);
      const { dataList, totalItem } = list.data.data;
      if (dataList.length !== 0) {
        const ids = dataList.map((item) => item.exhibitId).join();
        const [signCountData, statusInfo] = await Promise.all([
          freelogApp.getExhibitSignCount(ids),
          freelogApp.getExhibitAuthStatus(ids),
        ]);
        dataList.forEach((item) => {
          let index;
          index = signCountData.data.data.findIndex((resultItem) => resultItem.subjectId === item.exhibitId);
          if (index !== -1) item.signCount = signCountData.data.data[index].count;
          index = statusInfo.data.data.findIndex((resultItem) => resultItem.exhibitId === item.exhibitId);
          if (index !== -1) item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
        });
      }
      this.listData = init ? dataList : [...this.listData, ...dataList];
      this.total = totalItem;
      if (init) this.loading = false;
      this.myLoading = false;
    },

    /** 页面滚动 */
    scroll() {
      const scrollTop = app.scrollTop || 0;
      sessionStorage.setItem("searchListScroll", scrollTop);
      const clientHeight = app.clientHeight || 0;
      const scrollHeight = app.scrollHeight || 0;
      if (scrollTop + clientHeight < scrollHeight - 200) return;

      this.getList();
    },
  },
};
</script>
