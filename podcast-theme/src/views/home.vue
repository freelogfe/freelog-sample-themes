<template>
  <div class="home-wrapper">
    <!-- PC -->
    <div class="pc-home-wrapper">
      <div class="top-area">
        <div class="node-avatar">
          <img class="avatar-img" :src="$store.state.selfConfig.nodeAvatar" v-if="$store.state.selfConfig.nodeAvatar" />
          <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
        </div>
        <div class="node-info">
          <div class="node-title">{{ $store.state.selfConfig.nodeTitle }}</div>
          <div class="node-intros">
            <div class="node-intro" v-if="$store.state.selfConfig.nodeIntro1st">
              {{ $store.state.selfConfig.nodeIntro1st }}
            </div>
            <div class="node-intro" v-if="$store.state.selfConfig.nodeIntro2nd">
              {{ $store.state.selfConfig.nodeIntro2nd }}
            </div>
            <div class="node-intro" v-if="$store.state.selfConfig.nodeIntro3rd">
              {{ $store.state.selfConfig.nodeIntro3rd }}
            </div>
          </div>
          <!-- <div class="sign-count">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="count">{{ formatSignCount(signCount) }}</div>
          </div> -->
        </div>
      </div>

      <!-- <div class="content-area">
        <div class="content-top">
          <div class="top-title">专辑（{{ 7 }}）</div>
          <div class="view-all-btn" @click="$router.push('/album-list')">
            <span class="btn-label">全部</span>
            <i class="freelog fl-icon-zhankaigengduo"></i>
          </div>
        </div>
        <div class="album-list">
          <album v-for="item in 5" :key="item" />
        </div>
      </div> -->

      <template v-if="!loading">
        <div class="content-area" v-if="total">
          <div class="content-top">
            <div class="top-title">声音（{{ total }}）</div>
            <div class="view-all-btn" @click="$router.push('/voice-list')">
              <span class="btn-label">全部</span>
              <i class="freelog fl-icon-zhankaigengduo"></i>
            </div>
          </div>
          <div class="voice-list">
            <voice :data="item" v-for="item in listData" :key="item.exhibitId" />
          </div>
          <div class="view-more">
            <div class="text-btn" @click="$router.push('/voice-list')">查看更多声音</div>
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
import album from "@/components/album";
import voice from "@/components/voice";
import { getExhibitAuthStatus, getExhibitAvailable, getExhibitListByPaging, getExhibitSignCount } from "@/api/freelog";

export default {
  name: "home",

  components: {
    album,
    voice,
  },

  data() {
    return {
      listData: [],
      loading: false,
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
    this.getList();
  },

  methods: {
    /** 获取展品列表 */
    async getList() {
      if (this.loading) return;

      this.loading = true;
      const queryParams = {
        articleResourceTypes: "audio",
        isLoadVersionProperty: 1,
        limit: 10,
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
      this.listData = dataList;
      this.total = totalItem;
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  .pc-home-wrapper {
    padding-bottom: 168px;

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
        }

        .node-intros {
          opacity: 0.6;
          font-size: 14px;
          color: #ffffff;
          line-height: 20px;

          .node-intro {
            word-break: break-all;

            & + .node-intro {
              margin-top: 15px;
            }

            &:first-child {
              margin-top: 25px;
            }
          }
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

      .album-list {
        display: flex;
        justify-content: space-between;
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
      text-align: center;
      font-size: 30px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 36px;
      margin-top: 203px;
    }

    .skeleton {
      padding-top: 45px;

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
        background: linear-gradient(90deg, rgb(70, 70, 70) 25%, rgb(50, 50, 50) 37%, rgb(70, 70, 70) 63%) 0% 0% / 400%
          100%;
      }
    }
  }
}
</style>
