<!-- 展品列表 -->
<template>
  <div class="list-wrapper" :class="store.inMobile ? 'mobile' : 'pc'">
    <div class="title" v-if="title">{{ title }}</div>
    <div class="search-title" v-if="searchTitle">{{ searchTitle }}</div>

    <!-- 音乐 专辑 Tab -->
    <div class="music-album-tab" v-if="musicAlbumTab">
      <div class="tab-box">
        <div class="tab" :class="tab === 1 && 'active'" @click="changeTab(1)">音乐</div>
        <div class="tab" :class="tab === 2 && 'active'" @click="changeTab(2)">专辑</div>
      </div>
      <div
        class="total"
        v-if="
          !store.inMobile &&
          list?.length &&
          ((tab === 1 && musicLength) || (tab === 2 && albumLength))
        "
      >
        {{
          tab === 1
            ? musicLength && `共${musicLength}首音乐`
            : albumLength && `共${albumLength}张专辑`
        }}
      </div>
    </div>

    <template v-if="!loading">
      <!-- 音乐 -->
      <div v-if="$route.name === 'voice-list' && !store.inMobile">
        <!-- 最新发布 | 最早发布 -->
        <div class="music-drop-wrapper" ref="dropWrapper">
          <div class="selected-box" @click="handleShowDrop">
            <div class="txt">{{ selectedValue === 1 ? "最新发布" : "最早发布" }}</div>
            <div class="drop-trigger" :class="dropVisible ? 'rotate' : ''">
              <div class="triangle"></div>
            </div>
          </div>
          <div class="drop-list" v-show="dropVisible">
            <div
              class="drop-item"
              :class="selectedValue === 1 && 'selected'"
              @click="
                () => {
                  selectedValue = 1;
                  handleShowDrop();
                }
              "
            >
              最新发布
            </div>
            <div
              class="drop-item"
              :class="selectedValue === 2 && 'selected'"
              @click="
                () => {
                  selectedValue = 2;
                  handleShowDrop();
                }
              "
            >
              最早发布
            </div>
          </div>
        </div>
      </div>
      <div class="voice-list" v-if="tab === 1 && list.length && total !== 0">
        <div class="voice-bar" v-if="!store.inMobile">
          <span>歌名\歌手</span>
          <span>专辑</span>
          <span>时长</span>
        </div>
        <voice
          :data="item"
          :statusShow="statusShow"
          :authShow="authShow"
          v-for="item in sortedList"
          :key="`${item.exhibitId}${item?.itemId}`"
        />
        <div class="no-more-tip" v-if="list.length === total && noMoreTip">{{ noMoreTip }}</div>
      </div>
      <!-- 专辑 -->
      <div v-else-if="tab === 2 && list.length && total !== 0">
        <PCAlbum
          v-if="!store.inMobile"
          :hasHeder="false"
          :data="list.filter(i => i.articleInfo?.articleType === 2)"
        />
        <MobileAlbum v-else :data="list.filter(i => i.articleInfo?.articleType === 2)" />
      </div>
      <!-- 无数据 -->
      <div class="no-data-tip" v-if="noDataMessage">{{ noDataMessage }}</div>
    </template>

    <template v-else>
      <el-skeleton class="pc-skeleton" animated v-if="!store.inMobile">
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
import { useGlobalStore } from "@/store/global";
import voice from "@/components/voice.vue";
import PCAlbum from "@/components/album.vue";
import MobileAlbum from "@/components/mobile-album.vue";

const TabEnum = {
  Music: 1,
  Album: 2
};

export default {
  name: "list",

  components: {
    voice,
    PCAlbum,
    MobileAlbum
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
    },
    /** 音乐 | 专辑 */
    activeTab: {
      type: String,
      default: "Music"
    },
    /** 是否显示音乐，专辑Tab */
    musicAlbumTab: {
      type: Boolean,
      default: true
    }
  },

  data() {
    const store = useGlobalStore();

    return {
      store,
      tab: TabEnum[this.activeTab],
      dropVisible: false,
      selectedValue: 1,
      dropWrapper: null
    };
  },

  computed: {
    musicLength() {
      const data = this.list.filter(i => i.articleInfo?.articleType === 1);
      return data.length;
    },

    albumLength() {
      const data = this.list.filter(i => i.articleInfo?.articleType === 2);
      return data.length;
    },

    noDataMessage() {
      const isCollectionList = this.$route.name === "collection-list";
      const isSearchList = this.$route.name === "search-list";

      if (isCollectionList) {
        if (this.tab === 1 && !this.musicLength) {
          return "没有收藏任何音乐";
        }
        if (this.tab === 2 && !this.albumLength) {
          return "没有收藏任何专辑";
        }
      } else if (isSearchList) {
        if (this.tab === 1 && !this.musicLength) {
          return "暂无任何结果";
        }
        if (this.tab === 2 && !this.albumLength) {
          return "暂无任何结果";
        }
      } else if (this.total === 0 || (this.total === null && !this.list.length)) {
        return this.noDataTip;
      }

      return null;
    },

    sortedList() {
      if (this.$route.name === "voice-list") {
        if (this.selectedValue === 1) {
          // 降序排列
          return this.list
            .filter(i => i?.articleInfo?.articleType === 1)
            .sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime());
        } else {
          // 升序排列
          return this.list
            .filter(i => i?.articleInfo?.articleType === 1)
            .sort((a, b) => new Date(a.updateDate).getTime() - new Date(b.updateDate).getTime());
        }
      } else {
        return this.list.filter(i => i?.articleInfo?.articleType === 1);
      }
    }
  },

  methods: {
    changeTab(tab) {
      this.tab = tab;
    },
    handleShowDrop() {
      this.dropVisible = !this.dropVisible;
    },
    handleClickOutside(event) {
      if (this.$refs.dropWrapper && !this.$refs.dropWrapper.contains(event.target)) {
        this.dropVisible = false;
      }
    }
  },
  mounted() {
    console.log("mounted");
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    console.log("onBeforeUnmount");

    document.removeEventListener("click", this.handleClickOutside);
  }
};
</script>

<style lang="less" scoped>
.list-wrapper {
  &.mobile {
    padding: 30px 15px 120px;
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

    .music-album-tab {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
      .tab-box {
        display: flex;
        justify-content: space-around;
        align-items: center;
        .tab {
          position: relative;
          line-height: 38px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          opacity: 0.4;
          transition: all 0.2s ease-out;
          cursor: pointer;
          transform: perspective(1px) translateZ(0);
          // margin-right: 40px;

          &:last-of-type {
            margin-right: 0;
          }

          &:before {
            content: "";
            position: absolute;
            z-index: -1;
            left: 51%;
            right: 51%;
            bottom: 0;
            background-color: #44d7b6;
            opacity: 1;
            height: 4px;
            border-radius: 2px;
            transition: all 0.2s ease-out;
          }

          &:hover {
            opacity: 0.8;
          }

          &.active {
            opacity: 1;

            &::before {
              left: 0;
              right: 0;
            }
          }
        }
      }

      .total {
        margin-top: 30px;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        line-height: 18px;
        opacity: 0.4;
      }
    }

    .voice-wrapper + .voice-wrapper {
      margin-top: 15px;
    }

    .no-more-tip {
      margin-top: 40px;
    }

    .no-data-tip {
      // top: 60px;
      height: calc(100vh - 60px);
      font-size: 24px;
      line-height: 40px;
    }
  }

  &.pc {
    padding-top: 50px;

    .title,
    .search-title {
      font-size: 36px;
      font-weight: 600;
      color: #ffffff;
      line-height: 56px;
      opacity: 0.6;
      margin-bottom: 40px;
      word-break: break-all;
    }

    .music-album-tab {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
      .tab-box {
        display: flex;
        .tab {
          position: relative;
          line-height: 38px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          opacity: 0.4;
          transition: all 0.2s ease-out;
          cursor: pointer;
          transform: perspective(1px) translateZ(0);
          margin-right: 40px;

          &:last-of-type {
            margin-right: 0;
          }

          &:before {
            content: "";
            position: absolute;
            z-index: -1;
            left: 51%;
            right: 51%;
            bottom: 0;
            background-color: #fff;
            opacity: 1;
            height: 2px;
            border-radius: 2px;
            transition: all 0.2s ease-out;
          }

          &:hover {
            opacity: 0.8;
          }

          &.active {
            opacity: 0.8;

            &::before {
              left: 0;
              right: 0;
            }
          }
        }
      }

      .total {
        margin-top: 30px;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        line-height: 18px;
        opacity: 0.4;
      }
    }

    .music-drop-wrapper {
      display: flex;
      align-items: center;
      position: relative;
      margin: 40px 0;
      width: 100%;
      height: 20px;

      .selected-box {
        display: flex;
        align-items: center;
        .txt {
          height: 20px;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          line-height: 20px;
        }

        .drop-trigger {
          position: relative;
          margin-left: 7px;
          transition: transform 0.35s;

          &.rotate {
            transform: rotate(-180deg);
          }

          .triangle {
            width: 0;
            border-width: 6px 5px;
            border-style: solid;
            border-color: transparent;
            border-top-color: #fff;
            position: relative;
            top: 3px;
          }
        }
      }

      .drop-list {
        position: absolute;
        top: 25px;
        width: 240px;
        background: #000;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        padding: 5px 0;
        z-index: 2;
        -webkit-backdrop-filter: blur(25px);
        backdrop-filter: blur(25px);

        .drop-item {
          padding-left: 20px;
          height: 50px;
          line-height: 50px;
          color: hsla(0, 0%, 100%, 0.6);
          cursor: pointer;

          &.selected {
            color: #fff;
          }

          &:hover {
            background-color: #44d7b6;
            color: #fff;
          }
        }
      }
    }

    .voice-list {
      padding-bottom: 120px;

      .voice-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #292929;
        border-radius: 6px;
        padding: 6px 10px;
        margin-bottom: 15px;

        span {
          font-weight: 400;
          font-size: 12px;
          color: #ffffff;
          line-height: 18px;
          opacity: 0.4;

          &:nth-child(1) {
            width: 720px;
          }

          &:nth-child(2) {
            width: 340px;
          }

          &:nth-child(3) {
            width: 120px;
          }
        }
      }

      .voice-wrapper + .voice-wrapper {
        margin-top: 25px;
      }
    }

    .no-more-tip {
      margin-top: 30px;
    }

    .no-data-tip {
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
    // align-items: center;
    padding-top: calc((100vh - 272px) * 0.4 - 18px);
    justify-content: center;
    box-sizing: border-box;
  }

  .pc-skeleton {
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
