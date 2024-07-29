<!-- 音乐列表页 -->
<template>
  <div class="voice-list-wrapper">
    <list
      :list="listData"
      :loading="loading"
      :total="total"
      :musicAlbumTab="false"
      activeTab="Music"
      title="所有音乐"
      noMoreTip="已加载全部"
      noDataTip="暂无任何音乐"
    />
  </div>
</template>

<script>
import { freelogApp } from "freelog-runtime";
import { useGlobalStore } from "@/store/global";
import list from "@/components/list.vue";

export default {
  name: "voice-list",

  components: {
    list
  },

  data() {
    const store = useGlobalStore();

    return {
      listData: [],
      loading: false,
      myLoading: false,
      total: null,
      store
    };
  },

  watch: {
    "store.authIdList"(cur) {
      cur.forEach(id => {
        const item = this.listData.find(data => data.exhibitId === id);
        item.defaulterIdentityType = 0;
      });
    }
  },

  created() {
    this.getList(true);
  },

  activated() {
    const app = document.getElementById("app");
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

      if (init) this.loading = true;
      this.myLoading = true;
      this.skip = init ? 0 : this.skip + 20;
      const queryParams = {
        skip: this.skip,
        articleResourceTypes: "音频",
        isLoadVersionProperty: 1,
        limit: 20
      };
      const list = await freelogApp.getExhibitListByPaging(queryParams);
      const { dataList, totalItem } = list.data.data;

      if (dataList.length !== 0) {
        const ids = dataList.map(item => item.exhibitId).join();

        const [signCountData, statusInfo] = await Promise.all([
          freelogApp.getExhibitSignCount(ids),
          freelogApp.getExhibitAuthStatus(ids)
        ]);
        dataList.forEach(item => {
          let index;
          index = signCountData.data.data.findIndex(
            resultItem => resultItem.subjectId === item.exhibitId
          );
          if (index !== -1) item.signCount = signCountData.data.data[index].count;
          index = statusInfo.data.data.findIndex(
            resultItem => resultItem.exhibitId === item.exhibitId
          );
          if (index !== -1)
            item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
        });
      }
      this.listData = init ? dataList : [...this.listData, ...dataList];
      this.total = totalItem;
      if (init) this.loading = false;
      this.myLoading = false;
    },

    /** 页面滚动 */
    scroll() {
      const app = document.getElementById("app");
      const scrollTop = app.scrollTop || 0;
      sessionStorage.setItem("musicListScroll", scrollTop);
      const clientHeight = app.clientHeight || 0;
      const scrollHeight = app.scrollHeight || 0;
      if (scrollTop + clientHeight < scrollHeight - 200) return;

      this.getList();
    }
  }
};
</script>
