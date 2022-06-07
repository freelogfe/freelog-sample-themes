<template>
  <div class="voice-list-wrapper">
    <!-- PC -->
    <div class="pc-voice-list-wrapper">
      <div class="title">声音{{ total ? `（${total}）` : "" }}</div>

      <template v-if="!loading">
        <div class="voice-list" v-if="total">
          <voice :data="item" v-for="item in listData" :key="item.exhibitId" />
          <div class="no-more-tip" v-if="listData.length === total">已加载全部</div>
        </div>
        <div class="no-data-tip" v-else>暂无任何声音</div>
      </template>

      <el-skeleton class="skeleton" animated v-else>
        <template slot="template">
          <div class="voice-skeleton" v-for="item in 5" :key="item">
            <el-skeleton-item class="cover" variant="image" />
            <div class="info-area">
              <el-skeleton-item class="voice-title" variant="text" />
              <el-skeleton-item class="voice-intro" variant="text" />
              <el-skeleton-item class="voice-intro" variant="text" />
              <el-skeleton-item class="voice-others" variant="text" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
import voice from "@/components/voice";
import { getExhibitAuthStatus, getExhibitAvailable, getExhibitListByPaging, getExhibitSignCount } from "@/api/freelog";

export default {
  name: "voice-list",

  components: {
    voice,
  },

  data() {
    return {
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
        item.authCode = 200;
      });
    },
  },

  created() {
    this.getList(true);
  },

  mounted() {
    const app = document.getElementById("app");
    app.addEventListener("scroll", this.scroll);
    this.$once("hook:beforeDestroy", () => {
      app.removeEventListener("scroll", this.scroll);
    });
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
        articleResourceTypes: "audio",
        isLoadVersionProperty: 1,
        limit: 20,
      };
      const list = await getExhibitListByPaging(queryParams);
      const { dataList, totalItem } = list.data.data;
      if (dataList.length !== 0) {
        const ids = dataList.map((item) => item.exhibitId).join();
        const [signCountData, statusInfo, authLinkStatusInfo] = await Promise.all([
          getExhibitSignCount(ids),
          getExhibitAuthStatus(ids),
          getExhibitAvailable(ids),
        ]);
        dataList.forEach((item) => {
          let index;
          index = signCountData.data.data.findIndex((resultItem) => resultItem.subjectId === item.exhibitId);
          if (index !== -1) item.signCount = signCountData.data.data[index].count;
          index = statusInfo.data.data.findIndex((resultItem) => resultItem.exhibitId === item.exhibitId);
          if (index !== -1) item.authCode = statusInfo.data.data[index].authCode;
          index = authLinkStatusInfo.data.data.findIndex((resultItem) => resultItem.exhibitId === item.exhibitId);
          // 全链路授权码为301时，必定是授权链出错
          if (index !== -1)
            item.authLinkNormal = item.authCode === 301 ? false : authLinkStatusInfo.data.data[index].isAuth;
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
      const clientHeight = app.clientHeight || 0;
      const scrollHeight = app.scrollHeight || 0;
      if (scrollTop + clientHeight !== scrollHeight) return;

      this.getList();
    },
  },
};
</script>

<style lang="scss" scoped>
.voice-list-wrapper {
  .pc-voice-list-wrapper {
    padding-top: 20px;
    padding-bottom: 168px;

    .title {
      font-size: 36px;
      font-weight: 600;
      color: #ffffff;
      line-height: 56px;
      opacity: 0.6;
      margin-bottom: 50px;
    }

    .voice-list {
      width: 100%;

      .voice-wrapper + .voice-wrapper {
        margin-top: 25px;
      }

      .no-more-tip {
        width: 100%;
        text-align: center;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.2);
        line-height: 20px;
        margin-top: 30px;
      }
    }

    .no-data-tip {
      width: 100%;
      text-align: center;
      font-size: 30px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 36px;
      margin-top: 258px;
    }

    .skeleton {
      .voice-skeleton {
        width: 100%;
        display: flex;
        margin-top: 25px;

        .cover {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .info-area {
          display: flex;
          flex-direction: column;
          margin-left: 20px;

          .voice-title {
            height: 22px;
            width: 400px;
            margin-bottom: 10px;
          }

          .voice-intro {
            width: 700px;
            height: 18px;

            & + .voice-intro {
              margin-top: 4px;
            }
          }

          .voice-others {
            width: 150px;
            height: 18px;
            margin-top: 10px;
          }
        }
      }

      ::v-deep .el-skeleton.is-animated .el-skeleton__item {
        background: linear-gradient(90deg, rgb(70, 70, 70) 25%, rgb(50, 50, 50) 37%, rgb(70, 70, 70) 63%) 0% 0% / 400%
          100%;
      }
    }
  }
}
</style>
