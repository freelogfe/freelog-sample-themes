<!-- 搜索列表页 -->

<template>
  <div class="search-list-wrapper">
    <template v-if="!loading">
      <div class="program-list-wrapper-mobile" v-if="$store.state.inMobile">
        <div class="plw-header">
          {{ `查询到${this.listData.length}个相关结果` }}
        </div>
        <div v-if="listData.length" class="plw-body">
          <div class="plw-condition">
            <div class="left" v-clickOutside="dropDownShow">
              <div class="wrapper" @click="dropDownShow.value = !dropDownShow.value">
                <span class="txt">{{ currentSelect === 'update' ? "最近更新" : "最热门" }}</span>
                <div class="drop-trigger">
                  <div class="triangle"></div>
                </div>
              </div>
              <div class="drop-list" v-if="dropDownShow.value">
                <div
                  class="drop-item"
                  :class="{ selected: currentSelect === 'update' }"
                  @click="currentSelect = 'update'"
                >
                  最近更新
                </div>
                <div
                  class="drop-item"
                  :class="{ selected: currentSelect === 'hot' }"
                  @click="currentSelect = 'hot'"
                >
                  最热门
                </div>
              </div>
            </div>
           
          </div>
          <div class="plw-content">
            <div class="hot-container">
              <voice
                :data="item"
                v-for="item in listData"
                :key="item.exhibitId"
                mode="program"
              ></voice>
            </div>
          </div>
          <div class="plw-footer">已加载全部</div>
        </div>
        <div v-else class="plw-empty">暂无任何节目</div>
      </div>
  
      <div class="program-list-wrapper-pc" v-else>
        <div class="plw-header">
          {{ `“${keywords}”的搜索结果${this.listData.length ? '（' + this.listData.length + '）' : ''}` }}
        </div>
        <div v-if="listData.length" class="plw-body">
          <div class="plw-condition">
            <div class="left" v-clickOutside="dropDownShow">
              <div class="wrapper" @click="dropDownShow.value = !dropDownShow.value">
                <span class="txt">{{ currentSelect === 'update' ? "最近更新" : "最热门" }}</span>
                <div class="drop-trigger">
                  <div class="triangle"></div>
                </div>
              </div>
              <div class="drop-list" v-if="dropDownShow.value">
                <div
                  class="drop-item"
                  :class="{ selected: currentSelect === 'update' }"
                  @click="currentSelect = 'update'"
                >
                  最近更新
                </div>
                <div
                  class="drop-item"
                  :class="{ selected: currentSelect === 'hot' }"
                  @click="currentSelect = 'hot'"
                >
                  最热门
                </div>
              </div>
            </div>
            <div class="right">
              <div :class="{ selected: currentMode === 'card' }" @click="currentMode = 'card'">
                卡片模式
              </div>
              <div :class="{ selected: currentMode === 'list' }" @click="currentMode = 'list'">
                列表模式
              </div>
            </div>
          </div>
          <div class="plw-content">
            <div class="hot-container">
              <template v-if="currentMode === 'card'">
                <program :data="item" v-for="item in listData" :key="item.exhibitId"></program>
              </template>
              <template v-else>
                <voice
                  :data="item"
                  v-for="item in listData"
                  :key="item.exhibitId"
                  mode="program"
                ></voice>
              </template>
            </div>
          </div>
        </div>
        <div v-else class="plw-empty">暂无任何节目</div>
      </div>
    </template>

    <div class="skeleton" v-else>
      <div class="plw-skeleton-mobile" v-if="$store.state.inMobile">
        <el-skeleton animated>
          <template slot="template">
            <div class="mobile-skeleton">
              <el-skeleton-item class="total" variant="text" />
              <el-skeleton-item class="condition" variant="text" />
              <div class="program-skeleton" v-for="item in 10" :key="item">
                <el-skeleton-item class="program-cover" variant="image" />
                <div class="center">
                  <div class="program-title">
                    <el-skeleton-item  variant="text" />
                  </div>
                  <div>
                    <el-skeleton-item class="program-update" variant="text" />
                    <el-skeleton-item class="program-yonghu" variant="text" />
                  </div>
                </div>
                <el-skeleton-item class="program-others" variant="text" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <div class="plw-skeleton-pc" v-else>
        <el-skeleton animated>
          <template slot="template">
            <div class="pc-header">
              <el-skeleton-item class="pc-header-total" variant="text" />
              <div class="pc-header-condition">
                <el-skeleton-item variant="text" class="header-select" />
                <el-skeleton-item variant="text" class="header-card" />
                <el-skeleton-item variant="text" class="header-card" />
              </div>
            </div>
          </template>
        </el-skeleton>
        <el-skeleton animated v-if="currentMode === 'card'">
          <template slot="template">
            <div class="pc-skeleton">
              <div class="program-skeleton" v-for="item in 10" :key="item">
                <el-skeleton-item class="program-cover" variant="image" />
                <el-skeleton-item class="program-desc" variant="text" />
                <el-skeleton-item class="program-others" variant="text" />
              </div>
            </div>
          </template>
        </el-skeleton>
        <el-skeleton animated v-else>
          <template slot="template">
            <div class="pc-skeleton-voice">
              <div class="program-skeleton-voice" v-for="item in 5" :key="item">
                <div class="left">
                  <el-skeleton-item class="program-cover-voice" variant="image" />
                </div>
                <div class="center">
                  <el-skeleton-item class="program-others-first" variant="text" />
                  <el-skeleton-item class="program-others-second" variant="text" />
                  <el-skeleton-item class="program-others-thrid" variant="text" />
                  <el-skeleton-item class="program-others-fourth" variant="text" />
                </div>
                <div class="right">
                  <el-skeleton-item class="program-desc-voice" variant="text" />
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>    
    </div>
  </div>
</template>

<script>
import { freelogApp } from "freelog-runtime";
import program from "@/components/program";
import voice from "@/components/voice";
import { sleep } from "@/utils/common";

export default {
  name: "search-list",

  components: {
    program,
    voice
  },

  data() {
    return {
      dropDownShow: {
        value: false
      },
      currentSelect: "update", // "update" | "hot"
      currentMode: "card", // "card" | "list"
      keywords: "",
      listData: [],
      loading: false,
      myLoading: false,
      total: 0,
      limit: 20
    };
  },

  watch: {
    "$store.state.lastestAuthList"(cur) {
      cur.forEach(ele => {
        const items = this.listData.filter(data => data.exhibitId === ele.exhibitId);
        if (items.length) {
          for (const item of items) {
            item.defaulterIdentityType = ele.defaulterIdentityType;
          }
        }
      });
    },

    "$store.state.searchKey": {
      handler(cur) {
        if (!cur) {
          this.keywords = sessionStorage.getItem("searchKey")
          return
        }
        if (cur === this.keywords) return;

        this.keywords = cur;
        this.getList(true);
      },
      immediate: true
    },
    currentSelect(newValue) {
      this.sortList(newValue, this.listData)
    }
  },

  created() {
    this.getList(true);
  },

  activated() {
    const app = document.getElementById("appPodcast");
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
    this.$store.dispatch("updateLastestAuthList")
  },

  deactivated() {
    const app = document.getElementById("appPodcast");
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
        await sleep(800)
      }
      this.myLoading = true;
      this.skip = init ? 0 : this.skip + this.limit;
      const queryParams = {
        skip: this.skip,
        articleResourceTypes: "音频",
        isLoadVersionProperty: 1,
        limit: this.limit,
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
        });
      }
      const temp = init ? dataList : [...this.listData, ...dataList]
      this.listData = temp.filter(ele => ele.articleInfo.status === 1 && [0, 4].includes(ele.defaulterIdentityType));
      this.total = totalItem;
      if (init) this.loading = false;
      this.myLoading = false;
    },

    /** 页面滚动 */
    scroll() {
      const app = document.getElementById("appPodcast");
      const scrollTop = app.scrollTop || 0;
      // sessionStorage.setItem("searchListScroll", scrollTop);
      const clientHeight = app.clientHeight || 0;
      const scrollHeight = app.scrollHeight || 0;
      if (scrollTop + clientHeight < scrollHeight - 200) return;

      this.getList();
    },

    /** 条件排序 */
    sortList(newValue, dataList) {
      const result = dataList.sort((a, b) => {
        let aTimeStamp, bTimeStamp
        if (a.child) {
          aTimeStamp = new Date(a.child.createDate).getTime()
        } else {
          aTimeStamp = new Date(a.updateDate).getTime()
        }

        if (b.child) {
          bTimeStamp = new Date(b.child.createDate).getTime()
        } else {
          bTimeStamp = new Date(b.updateDate).getTime()
        }
        if (newValue === 'update') {
          return bTimeStamp - aTimeStamp
        } else {
          return b.signCount - a.signCount
        }
      })
      this.listData = result
    },
  }
};
</script>

<style lang="scss" scoped>
.search-list-wrapper {
  .program-list-wrapper-mobile {
    .plw-header {
      padding: 30px 15px;
      height: 40px;
      font-weight: 400;
      font-size: 34px;
      color: var(--text-other-color);
      line-height: 40px;
      opacity: 0.6;
    }
  
    .plw-body {
      padding: 0px 15px 40px;
      .plw-condition {
        margin: 0px 0px 20px;
        width: 100%;
        height: 20px;
        display: flex;
        .left {
          display: flex;
          align-items: center;
          position: relative;
          .wrapper {
            display: flex;
            align-items: center;
            position: relative;
            .txt {
              height: 20px;
              font-weight: 600;
              font-size: 14px;
              color: var(--text-other-color);
              line-height: 20px;
            }
            .drop-trigger {
              position: relative;
              margin-left: 7px;
              .triangle {
                width: 0px;
                border-width: 6px 5px;
                border-style: solid;
                border-color: transparent;
                border-top-color: var(--text-other-color);
                position: relative;
                top: 3px;
              }
            }
          }
          .drop-list {
            position: absolute;
            top: 25px;
            width: 240px;
            background:var(--bg-skin);
            color: var(--text-eighth-color);
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 5px 0px;
            z-index: 2;
            backdrop-filter: blur(25px);
            .drop-item {
              padding-left: 20px;
              height: 50px;
              line-height: 50px;
              // color: rgba(255, 255, 255, 0.6);
              &:hover {
                background-color: #2784ff;
                color: var(--text-other-color);
              }
              &.selected {
                // color: rgba(255, 255, 255, 1);
              }
            }
          }
        }
      }
      .plw-content {
        .hot-container {
          display: flex;
          gap: 30px 20px;
          flex-wrap: wrap;
        }
      }
      .plw-footer {
        padding: 40px 0px 0px;
        text-align: center;
        font-weight: 400;
        font-size: 14px;
        color: var(--text-other-color);
        opacity: 0.2;
      }
    }
  
    .plw-empty {
      width: 100%;
      text-align: center;
      font-size: 30px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 20px;
      margin-top: 258px;
    }
  }
  .program-list-wrapper-pc {
    .plw-header {
      height: 56px;
      font-weight: 600;
      font-size: 36px;
      color: var(--text-other-color);
      line-height: 56px;
      opacity: 0.6;
    }
  
    .plw-body {
      padding-bottom: 40px;
      .plw-condition {
        margin: 40px 0px;
        width: 100%;
        height: 20px;
        display: flex;
        .left {
          display: flex;
          align-items: center;
          position: relative;
          .wrapper {
            display: flex;
            align-items: center;
            position: relative;
            .txt {
              height: 20px;
              font-weight: 600;
              font-size: 14px;
              color: var(--text-other-color);
              line-height: 20px;
            }
            .drop-trigger {
              position: relative;
              margin-left: 7px;
              .triangle {
                width: 0px;
                border-width: 6px 5px;
                border-style: solid;
                border-color: transparent;
                border-top-color: var(--text-other-color);
                position: relative;
                top: 3px;
              }
            }
          }
          .drop-list {
            position: absolute;
            top: 25px;
            width: 240px;
            background:var(--bg-skin);
            color: var(--text-eighth-color);
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 5px 0px;
            z-index: 2;
            backdrop-filter: blur(25px);
            .drop-item {
              padding-left: 20px;
              height: 50px;
              line-height: 50px;
              // color: rgba(255, 255, 255, 0.6);
              &:hover {
                background-color: #2784ff;
                color: var(--text-other-color);
              }
              &.selected {
                // color: rgba(255, 255, 255, 1);
              }
            }
          }
        }
        .right {
          display: flex;
          margin-left: auto;
          color: rgba(255, 255, 255, 0.4);
          div {
            cursor: pointer;
            &:hover {
              color: rgba(255, 255, 255, 0.6);
            }
          }
          div:first-child {
            margin-right: 30px;
          }
          div.selected {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
      .plw-content {
        .hot-container {
          display: flex;
          gap: 30px 20px;
          flex-wrap: wrap;
        }
      }
    }
  
    .plw-empty {
      width: 100%;
      text-align: center;
      font-size: 30px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 20px;
      margin-top: 258px;
    }
  }
  .skeleton {
    .plw-skeleton-mobile {
      padding: 0px 15px;
      .mobile-skeleton {
        .total {
          height: 40px;
          margin: 30px 0px;
        }
        .condition {
          height: 20px;
          margin-bottom: 20px;
        }
        .program-skeleton {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          &:last-child {
            margin-bottom: 0px;
          }
          .program-cover {
            width: 56px;
            height: 56px;
            border-radius: 10px;
            margin-right: 10px;
          }
          .center {
            margin-right: auto;
            .program-title {
              width: 200px;
              height: 22px;
              border-radius: 4px;
              margin-bottom: 16px;
            }
            div {
              height: 18px;
              .program-update, .program-yonghu {
                width: 40px;
                height: 18px;
                border-radius: 4px;
              }
              .program-yonghu {
                margin-left: 10px;
              }
            }
          }
          .program-others {
            width: 20px;
            height: 20px;
            border-radius: 4px;
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

    .plw-skeleton-pc {
      .pc-header {
        .pc-header-total {
          height: 56px;
        }
        .pc-header-condition {
          margin: 40px 0px;
          display: flex;
          .header-select {
            height: 20px;
            width: 500px;
            margin-right: auto;
          }
          .header-card {
            height: 20px;
            width: 56px;
            &:last-child {
              margin-left: 30px;
            }
          }
        }
      }
      .pc-skeleton {
        display: flex;
        gap: 50px 20px;
        flex-wrap: wrap;
        .program-skeleton {
          width: 210px;
          .program-cover {
            height: 210px;
            margin-bottom: 10px;
            border-radius: 10px;
          }
          .program-desc {
            width: 160px;
            height: 20px;
            margin-bottom: 10px;
            border-radius: 4px;
          }
          .program-others {
            width: 100px;
            height: 18px;
            border-radius: 4px;
          }
        }
      }
      .program-skeleton-voice {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
        &:last-child {
          margin-bottom: 0px;
        }
        .left .program-cover-voice {
          width: 100px;
          height: 100px;
          border-radius: 10px;
          margin-right: 20px;
        }
        .center {
          margin-right: auto;
          display: flex;
          flex-direction: column;
          .program-others-first {
            width: 160px;
            height: 20px;
            border-radius: 4px;
            margin-bottom: 10px;
          }
          .program-others-second {
            width: 700px;
            height: 18px;
            border-radius: 4px;
            margin-bottom: 6px;
          }
          .program-others-thrid {
            width: 500px;
            height: 18px;
            border-radius: 4px;
            margin-bottom: 10px;
          }
          .program-others-fourth {
            width: 100px;
            height: 18px;
            border-radius: 4px;
          }
        }
        .right {
          width: 60px;
          height: 18px;
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