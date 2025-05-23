<!-- 音乐列表页 -->
<template>
  <div class="voice-list-wrapper">
    <list
      :list="musicData"
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
      store,
      subTotal: 0,
      subSkip: 0,
      subTempData: []
    };
  },

  computed: {
    musicData() {
      return this.listData.filter(i => i.articleInfo.status !== 2);
    }
  },
  watch: {
    "store.authIdList": {
      handler(cur) {
        cur.forEach(id => {
          const item = this.listData.find(data => data.exhibitId === id);
          if (item) {
            item.defaulterIdentityType = 0;
          }
        });
      },
      deep: true
    }
  },

  created() {
    this.getList(true);
  },

  activated() {
    const app = document.getElementById("app");
    app.addEventListener("scroll", this.scroll);

    /** 回到顶部 */
    const scrollToTop = () => {
      app?.scroll({ top: 0 });
    };
    scrollToTop();
  },

  deactivated() {
    const app = document.getElementById("app");
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 获取音乐列表 */
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

        // 使用for...of确保顺序执行
        for (const item of dataList) {
          let index;
          index = signCountData.data.data.findIndex(
            resultItem => resultItem.subjectId === item.exhibitId
          );
          if (index !== -1) {
            item.signCount = signCountData.data.data[index].count;
          }
          index = statusInfo.data.data.findIndex(
            resultItem => resultItem.exhibitId === item.exhibitId
          );
          if (index !== -1) {
            item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
          }

          // 获取合集里的单品列表
          if (item.articleInfo.articleType === 2) {
            await this.getCollectionList(item.exhibitId, item.exhibitTitle, item.coverImages);
          } else {
            this.listData.push(item);
          }
        }
      }

      // this.listData = init ? dataList : [...this.listData, ...dataList];
      this.total = totalItem;
      if (init) this.loading = false;
      this.myLoading = false;
    },

    /** 获取合集里的单品列表 */
    async getCollectionList(collectionID, exhibitTitle, images) {
      const subList = await freelogApp.getCollectionSubList(collectionID, {
        skip: this.subSkip,
        limit: 1_000,
        isShowDetailInfo: 1
      });
      const { dataList, totalItem } = subList.data.data;
      this.subTotal = totalItem;

      if (dataList.length !== 0) {
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

            item.updateDate = item.articleInfo.latestVersionReleaseDate;
            item.coverImages = images;
            item.versionInfo = { exhibitProperty: item.articleInfo?.articleProperty };
            item.exhibitTitle = item.itemTitle;
            item.exhibitIntro = item.articleInfo.intro;
            item.albumName = exhibitTitle;
            item.exhibitId = collectionID;
          });
        }
      }

      this.subTempData.push(...dataList);
      this.listData.push(...dataList);

      if (this.subTempData.length < this.subTotal) {
        this.subSkip = this.subSkip + 1_000;
        this.getCollectionList(collectionID, exhibitTitle, images);
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
