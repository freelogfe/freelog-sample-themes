<!-- 搜索列表页 -->
<template>
  <div class="search-list-wrapper">
    <list
      :list="listData"
      :loading="loading"
      :total="total"
      :searchTitle="
        store.inMobile
          ? total
            ? `查询到${total}个相关结果`
            : ''
          : `“${keywords}”的搜索结果${total ? '（' + total + '）' : ''}`
      "
      noMoreTip="已加载全部"
      noDataTip="暂无任何结果"
    />
  </div>
</template>

<script>
import list from "@/components/list.vue";
import { freelogApp } from "freelog-runtime";
import { useGlobalStore } from "@/store/global";

export default {
  name: "search-list",

  components: {
    list
  },

  data() {
    const store = useGlobalStore();

    return {
      keywords: "",
      listData: [],
      loading: false,
      myLoading: false,
      total: 0,
      store,
      subTotal: 0,
      subSkip: 0,
      subTempData: [],
      collectionData: []
    };
  },

  watch: {
    "store.authIdList"(cur) {
      cur.forEach(id => {
        const item = this.listData.find(data => data.exhibitId === id);
        item.defaulterIdentityType = 0;
      });
    },

    "store.searchKey": {
      handler(cur) {
        if (cur === this.keywords) return;

        this.keywords = cur;
        this.getList(true);
      },
      immediate: true
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
    /** 获取列表 */
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
        keywords: this.keywords
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

          // 获取合集里的单品列表
          if (item.articleInfo.articleType === 2) {
            this.getCollectionList(item.exhibitId, item.exhibitName, item.coverImages);
          }
        });
      }
      this.listData = init ? dataList : [...this.listData, ...dataList];
      this.total = totalItem;
      if (init) this.loading = false;
      this.myLoading = false;
    },

    /** 获取合集里的单品列表 */
    async getCollectionList(collectionID, exhibitName, coverImages) {
      const subList = await freelogApp.getCollectionSubList(collectionID, {
        skip: this.subSkip,
        limit: 1_000,
        isShowDetailInfo: 1
      });
      const { dataList, totalItem } = subList.data.data;
      this.subTotal = totalItem;

      if (dataList?.length !== 0) {
        const ids = dataList.map(item => item.itemId).join();
        const statusInfo = await freelogApp.getCollectionSubAuth(collectionID, {
          itemIds: ids
        });

        if (statusInfo.data.data) {
          dataList.forEach(item => {
            const index = statusInfo.data.data.findIndex(
              resultItem => resultItem.itemId === item.itemId
            );
            if (index !== -1) {
              item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
            }

            item.exhibitTitle = item.itemTitle;
            item.exhibitIntro = item.articleInfo.intro;
            item.exhibitId = collectionID;
            item.coverImages = coverImages;
            item.versionInfo = { exhibitProperty: item.articleInfo.articleProperty };
            item.albumName = exhibitName;
          });
        }
      }

      this.subTempData.push(...dataList);
      this.collectionData = [...this.collectionData, ...dataList];
      this.listData = [...this.listData, ...this.collectionData];
      this.total = this.listData.length;

      if (this.subTempData.length < this.subTotal) {
        this.subSkip = this.subSkip + 1_000;
        this.getCollectionList(collectionID, exhibitName, coverImages);
      } else {
        this.subTotal = 0;
        this.subSkip = 0;
        this.subTempData = [];
      }
    },

    /** 页面滚动 */
    scroll() {
      const app = document.getElementById("app");
      const scrollTop = app.scrollTop || 0;
      const clientHeight = app.clientHeight || 0;
      const scrollHeight = app.scrollHeight || 0;
      if (scrollTop + clientHeight < scrollHeight - 200) return;

      this.getList();
    }
  }
};
</script>
