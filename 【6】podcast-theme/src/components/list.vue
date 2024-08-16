<!-- 展品列表 -->

<template>
  <div class="list-wrapper" :class="$store.state.inMobile ? 'mobile' : 'pc'">
    <div class="title" v-if="title">{{ title }}</div>
    <div class="search-title" v-if="searchTitle">{{ searchTitle }}</div>

    <template v-if="!loading">
      <div class="voice-list" v-if="list && total !== 0">
        <voice
          :data="item"
          :statusShow="statusShow"
          :authShow="authShow"
          v-for="item in list"
          :key="item.exhibitId"
          mode="program"
        />
        <div class="no-more-tip" v-if="list.length === total && noMoreTip">{{ noMoreTip }}</div>
      </div>
      <div class="no-data-tip" v-if="total === 0 || (total === null && !list.length)">
        {{ noDataTip }}
      </div>
    </template>

    <template v-else>
      <el-skeleton class="pc-skeleton" animated v-if="!$store.state.inMobile">
        <template slot="template">
          <div class="voice-skeleton" v-for="item in 5" :key="item">
            <el-skeleton-item class="cover" variant="image" />
            <div class="info-area">
              <el-skeleton-item class="voice-title" variant="text" />
              <el-skeleton-item class="voice-intro" variant="text" />
              <el-skeleton-item class="voice-intro" variant="text" />
              <el-skeleton-item class="voice-others" variant="text" />
            </div>
            <el-skeleton-item class="voice-duration" variant="text" />
          </div>
        </template>
      </el-skeleton>

      <el-skeleton class="mobile-skeleton" animated v-else>
        <template slot="template">
          <div class="voice-skeleton" v-for="item in 4" :key="item">
            <el-skeleton-item class="cover" variant="image" />
            <div class="info-area">
              <el-skeleton-item class="voice-title" variant="text" />
              <el-skeleton-item class="voice-duration" variant="text" />
              <el-skeleton-item class="voice-others" variant="text" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </template>
  </div>
</template>

<script>
import voice from "@/components/voice";

export default {
  name: "list",

  components: {
    voice
  },

  props: {
    /** 列表数据 */
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    /** 数据总条目数 */
    total: {
      type: Number,
      default: null
    },
    /** 数据是否加载中 */
    loading: {
      type: Boolean,
      default: false
    },
    /** 列表标题 */
    title: {
      type: String,
      default: ""
    },
    /** 搜索列表标题 */
    searchTitle: {
      type: String,
      default: ""
    },
    /** 无更多数据提示文本 */
    noMoreTip: {
      type: String,
      default: ""
    },
    /** 无数据提示文本 */
    noDataTip: {
      type: String,
      default: ""
    },
    /** 是否显示上线状态 */
    statusShow: {
      type: Boolean,
      default: false
    },
    /** 是否显示授权状态 */
    authShow: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.list-wrapper {
  &.mobile {
    padding: 30px 15px 40px;
    box-sizing: border-box;

    .title {
      font-size: 34px;
      color: #ffffff;
      line-height: 40px;
      margin-bottom: 30px;
    }

    .search-title {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 22px;
      margin-bottom: 30px;
    }

    .voice-wrapper + .voice-wrapper {
      margin-top: 15px;
    }

    .no-more-tip {
      margin-top: 40px;
    }

    .no-data-tip {
      top: 60px;
      height: calc(100vh - 60px);
      font-size: 24px;
      line-height: 40px;
    }
  }

  &.pc {
    padding-top: 20px;

    .title,
    .search-title {
      font-size: 36px;
      font-weight: 600;
      color: #ffffff;
      line-height: 56px;
      opacity: 0.6;
      margin-bottom: 50px;
      word-break: break-all;
    }

    .voice-list {
      padding-bottom: 120px;

      .voice-wrapper + .voice-wrapper {
        margin-top: 25px;
      }
    }

    .no-more-tip {
      margin-top: 30px;
    }

    .no-data-tip {
      top: 98px;
      height: calc(100vh - 98px);
      font-size: 30px;
      line-height: 36px;
    }
  }

  .voice-list {
    width: 100%;

    .no-more-tip {
      width: 100%;
      text-align: center;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.2);
      line-height: 20px;
    }
  }

  .no-data-tip {
    position: absolute;
    left: 0;
    right: 0;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pc-skeleton {
    .voice-skeleton {
      width: 100%;
      display: flex;
      margin-top: 25px;
      align-items: center;

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
        margin-right: auto;
        
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

      .voice-duration {
        height: 20px;
        width: 40px;
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

  .mobile-skeleton {
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
</style>
