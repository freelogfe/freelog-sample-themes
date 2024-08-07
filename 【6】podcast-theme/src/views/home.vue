<!-- 首页 -->

<template>
  <div class="home-wrapper">
    <!-- mobile -->
    <div class="mobile-home-wrapper" v-if="$store.state.inMobile">
      <div class="node-avatar">
        <img class="avatar-img" :src="nodeInfo.nodeLogo" v-if="nodeInfo.nodeLogo" />
        <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
        <div class="node-info" @click="nodeInfoPopupShow = true">
          <div class="node-title">{{ nodeInfo.nodeTitle }}</div>
          <div class="node-intro" v-html="nodeInfo.nodeShortDescription"></div>
        </div>
      </div>

      <transition name="fade">
        <div class="node-info-popup" @click="nodeInfoPopupShow = false" v-if="nodeInfoPopupShow">
          <div class="node-title">{{ nodeInfo.nodeTitle }}</div>
          <div class="node-desc" v-html="nodeInfo.nodeShortDescription"></div>
        </div>
      </transition>

      <template v-if="!loading">
        <div class="content-area" v-if="total">
          <div class="content-top">
            <div class="top-title">声音（{{ total }}）</div>
            <div class="view-all-btn" @click="$router.myPush('/voice-list')">
              <span class="btn-label">全部</span>
              <i class="freelog fl-icon-zhankaigengduo"></i>
            </div>
          </div>
          <div class="voice-list">
            <voice :data="item" v-for="item in listData" :key="item.exhibitId" />
          </div>
          <div class="view-more" v-if="total > 10">
            <div class="view-more-btn" @click="$router.myPush('/voice-list')">查看更多声音</div>
          </div>
        </div>

        <div class="no-data-tip" v-else>
          <div>当前节点暂无任何声音</div>
          <div>请稍后查看</div>
        </div>
      </template>

      <el-skeleton class="skeleton" animated v-else>
        <template slot="template">
          <el-skeleton-item class="title" variant="text" />
          <div class="voice-skeleton" v-for="item in 2" :key="item">
            <el-skeleton-item class="cover" variant="image" />
            <div class="info-area">
              <el-skeleton-item class="voice-title" variant="text" />
              <el-skeleton-item class="voice-duration" variant="text" />
              <el-skeleton-item class="voice-others" variant="text" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- PC -->
    <div class="pc-home-wrapper" v-if="$store.state.inMobile === false">
      <div class="top-area">
        <div class="node-avatar">
          <img class="avatar-img" :src="nodeInfo.nodeLogo" v-if="nodeInfo.nodeLogo" />
          <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
        </div>
        <div class="node-info">
          <div class="node-title" :title="nodeInfo.nodeTitle">
            {{ nodeInfo.nodeTitle }}
          </div>
          <div
            class="node-intro"
            v-html="nodeInfo.nodeShortDescription"
            :title="nodeInfo.nodeShortDescription"
          ></div>
        </div>
      </div>

      <template v-if="!loading">
        <div class="content-area" v-if="total">
          <div class="content-top">
            <div class="top-title">声音（{{ total }}）</div>
            <div class="view-all-btn" @click="$router.myPush('/voice-list')">
              <span class="btn-label">全部</span>
              <i class="freelog fl-icon-zhankaigengduo"></i>
            </div>
          </div>
          <div class="voice-list">
            <voice :data="item" v-for="item in listData" :key="item.exhibitId" />
          </div>
          <div class="view-more" v-if="total > 10">
            <div class="text-btn" @click="$router.myPush('/voice-list')">查看更多声音</div>
          </div>
        </div>

        <div class="no-data-tip" v-else>当前节点暂无任何声音，请稍后查看</div>
      </template>

      <el-skeleton class="skeleton" animated v-else>
        <template slot="template">
          <el-skeleton-item class="title" variant="text" />
          <div class="voice-skeleton" v-for="item in 3" :key="item">
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
import { freelogApp } from "freelog-runtime";

export default {
  name: "home",

  components: {
    voice
  },

  data() {
    return {
      listData: [],
      loading: false,
      total: 0,
      nodeInfo: {},
      nodeInfoPopupShow: false
    };
  },

  watch: {
    "$store.state.authIdList"(cur) {
      cur.forEach(id => {
        const item = this.listData.find(data => data.exhibitId === id);
        if (item) item.defaulterIdentityType = 0;
      });
    }
  },

  computed: {
    /** 自定义配置 */
    selfConfig() {
      return this.$store.state.selfConfig;
    }
  },

  created() {
    this.nodeInfo = freelogApp.nodeInfo;
    this.getList();
  },

  activated() {
    const app = document.getElementById("app");
    const { routerMode } = this.$store.state;
    if (routerMode === 1) {
      // push 过来，滚动条回到顶部
      app.scroll({ top: 0 });
      sessionStorage.setItem("homeScroll", 0);
    } else if (routerMode === 2) {
      // back 过来，滚动条回到之前位置
      const scrollTop = sessionStorage.getItem("homeScroll") || 0;
      app.scroll({ top: scrollTop });
    }
    app.addEventListener("scroll", this.scroll);
  },

  deactivated() {
    const app = document.getElementById("app");
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 获取展品列表 */
    async getList() {
      if (this.loading) return;

      this.loading = true;
      const queryParams = {
        articleResourceTypes: "音频",
        isLoadVersionProperty: 1,
        limit: 10
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
      this.listData = dataList;
      this.total = totalItem;
      this.loading = false;
    },

    /** 页面滚动 */
    scroll() {
      const scrollTop = app.scrollTop || 0;
      sessionStorage.setItem("homeScroll", scrollTop);
    }
  }
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  // mobile
  .mobile-home-wrapper {
    display: flex;
    flex-direction: column;

    .node-avatar {
      position: relative;
      width: 100vw;
      height: 100vw;
      background-color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .avatar-img {
        height: 100%;
      }

      .default-avatar {
        width: 140px;
        height: 140px;
      }

      .node-info {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #222222 100%);
        padding: 40px 15px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        .node-title {
          word-break: break-all;
          font-size: 40px;
          font-weight: 600;
          color: #ffffff;
          line-height: 60px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        .node-intro {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 20px;
          margin-top: 10px;
          word-break: break-all;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }
      }
    }

    .node-info-popup {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      padding: 30px 20px;
      box-sizing: border-box;
      overflow-y: auto;
      z-index: 200;

      .node-title {
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
        line-height: 30px;
      }

      .node-desc {
        font-size: 14px;
        color: #ffffff;
        line-height: 20px;
        margin-top: 20px;
      }
    }

    .content-area {
      width: 100%;
      padding: 0 15px 120px;
      box-sizing: border-box;

      .content-top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-top: 10px;
        margin-bottom: 30px;

        .top-title {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          line-height: 28px;
          opacity: 0.6;
        }

        .view-all-btn {
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;

          &:active {
            color: rgba(255, 255, 255, 0.4);
          }

          .btn-label {
            font-size: 14px;
            font-weight: 600;
            line-height: 20px;
          }

          .freelog {
            font-size: 7px;
            margin-left: 5px;
          }
        }
      }

      .voice-list {
        .voice-wrapper + .voice-wrapper {
          margin-top: 15px;
        }
      }

      .view-more {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 40px;

        .view-more-btn {
          font-size: 14px;
          line-height: 20px;
          color: #2784ff;

          &:active {
            color: rgba(39, 132, 255, 0.6);
          }
        }
      }
    }

    .no-data-tip {
      width: 100%;
      height: calc(100vh - 100vw);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 40px;
    }

    .skeleton {
      height: calc(100vh - 100vw);
      padding: 10px 15px;
      box-sizing: border-box;
      overflow: hidden;

      .title {
        width: 150px;
        height: 28px;
        margin-bottom: 30px;
      }

      .voice-skeleton {
        width: 100%;
        display: flex;

        & + .voice-skeleton {
          margin-top: 15px;
        }

        .cover {
          width: 70px;
          height: 70px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .info-area {
          display: flex;
          flex-direction: column;
          margin-left: 20px;

          .voice-title {
            height: 22px;
            width: 200px;
          }

          .voice-duration {
            width: 50px;
            height: 20px;
            margin-top: 5px;
          }

          .voice-others {
            width: 100px;
            height: 18px;
            margin-top: 5px;
          }
        }
      }

      ::v-deep .el-skeleton.is-animated .el-skeleton__item {
        background: linear-gradient(
            90deg,
            rgb(70, 70, 70) 25%,
            rgb(50, 50, 50) 37%,
            rgb(70, 70, 70) 63%
          )
          0% 0% / 400% 100%;
      }
    }
  }

  // PC
  .pc-home-wrapper {
    .top-area {
      padding: 20px 0 50px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .node-avatar {
        width: 240px;
        height: 240px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: #252525;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .avatar-img {
          height: 100%;
        }

        .default-avatar {
          width: 100px;
          height: 100px;
        }
      }

      .node-info {
        flex: 1;
        margin-left: 50px;

        .node-title {
          word-break: break-all;
          font-size: 40px;
          font-weight: 600;
          color: #ffffff;
          line-height: 60px;
          opacity: 0.8;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        .node-intro {
          opacity: 0.6;
          font-size: 14px;
          color: #ffffff;
          line-height: 20px;
          margin-top: 25px;
          word-break: break-all;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 4;
          overflow: hidden;
        }

        .sign-count {
          display: flex;
          align-items: center;
          opacity: 0.6;
          margin-top: 35px;

          .freelog {
            font-size: 18px;
          }

          .count {
            font-size: 14px;
            color: #ffffff;
            line-height: 20px;
            margin-left: 5px;
          }
        }
      }
    }

    .content-area {
      padding-top: 45px;
      padding-bottom: 120px;

      .content-top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 25px;

        .top-title {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          line-height: 28px;
          opacity: 0.6;
        }

        .view-all-btn {
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            color: #2784ff;
          }

          &:active {
            color: rgba(39, 132, 255, 0.8);
          }

          .btn-label {
            font-size: 14px;
            font-weight: 600;
            line-height: 20px;
          }

          .freelog {
            font-size: 7px;
            margin-left: 5px;
          }
        }
      }

      .voice-list {
        .voice-wrapper + .voice-wrapper {
          margin-top: 25px;
        }
      }

      .view-more {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-top: 25px;

        .text-btn {
          font-size: 14px;
          line-height: 20px;
        }
      }
    }

    .no-data-tip {
      width: 100%;
      height: calc(100vh - 98px - 313px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      color: rgba(255, 255, 255, 0.4);
    }

    .skeleton {
      height: calc(100vh - 98px - 313px);
      padding-top: 45px;
      box-sizing: border-box;
      overflow: hidden;

      .title {
        width: 150px;
        height: 28px;
      }

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
        background: linear-gradient(
            90deg,
            rgb(70, 70, 70) 25%,
            rgb(50, 50, 50) 37%,
            rgb(70, 70, 70) 63%
          )
          0% 0% / 400% 100%;
      }
    }
  }
}
</style>
