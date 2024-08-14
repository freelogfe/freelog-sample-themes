<template>
  <div class="program-list">
    <div class="program-list-wrapper-mobile" v-if="$store.state.inMobile">
      <div class="plw-header">
        <label>所有节目</label>
        <span>({{ total }})</span>
      </div>
      <div v-if="hotList.length" class="plw-body">
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
              v-for="item in hotList"
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
        <label>所有节目</label>
        <span>({{ total }})</span>
      </div>
      <div v-if="hotList.length" class="plw-body">
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
              <program :data="item" v-for="item in hotList" :key="item.exhibitId"></program>
            </template>
            <template v-else>
              <voice
                :data="item"
                v-for="item in hotList"
                :key="item.exhibitId"
                mode="program"
              ></voice>
            </template>
          </div>
        </div>
      </div>
      <div v-else class="plw-empty">暂无任何节目</div>
    </div>
  </div>
</template>

<script>
import { freelogApp } from "freelog-runtime";
import program from "@/components/program";
import voice from "@/components/voice";

export default {
  name: "programList",
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
      listData: [],
      nodeInfo: {},
      total: 0
    };
  },
  created() {
    this.nodeInfo = freelogApp.nodeInfo;
    this.getList();
  },
  activated() {
    this.$store.dispatch("updateLastestAuthList")
  },
  computed: {
    hotList() {
      return JSON.parse(JSON.stringify(this.listData.slice()));
    }
  },
  watch: {
    currentSelect(newValue) {
      this.sortList(newValue, this.listData)
    },

    "$store.state.lastestAuthList"(cur) {
      cur.forEach(ele => {
        const item = this.listData.find(data => data.exhibitId === ele.exhibitId);
        if (item) item.defaulterIdentityType = ele.defaulterIdentityType;
      });
    }
  },
  methods: {
    /** 获取展品列表 */
    async getList() {
      if (this.loading) return;
      this.loading = true;
      const dataList = await this.queryList()
      await this.querySubNum(dataList)
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
      this.sortList('update', dataList)
      this.total = dataList.length;
      this.loading = false;
    },
    /** 获取展品列表 */
    async queryList(options = { skip: 0, limit: 100 }) {
      let { skip, limit } = options
      const result = []
      const list = await freelogApp.getExhibitListByPaging({
        ...options,
        articleResourceTypes: "音频",
        isLoadVersionProperty: 1,
      });
      const { dataList, totalItem } = list.data.data;
      result.push(...dataList)
      if (totalItem > (skip + 1) * limit) {
        skip = (skip + 1) * limit
        result.push(...await this.queryList({ skip })) 
      }
      return result
    },
    /** 获取展品列表 */
    sortList(newValue, dataList) {
      const result = dataList.sort((a, b) => {
        let aTimeStamp, bTimeStamp
        if (a.articleInfo.child) {
          aTimeStamp = new Date(a.child.createDate).getTime()
        } else {
          aTimeStamp = new Date(a.updateDate).getTime()
        }

        if (b.articleInfo.child) {
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
    /** 获取合集的子作品数量 */
    async querySubNum(dataList) {
      if (dataList.length === 0) return
      const allPoolIds = dataList.filter(ele => ele.articleInfo.articleType === 2).map(ele => ele.exhibitId)
      const allPoolIdsStr = allPoolIds.join(',')
      const res = await freelogApp.getCollectionsSubList(allPoolIdsStr, {
        sortType: 1, 
        skip: 0,
        limit: allPoolIds.length,
        isShowDetailInfo: 1, 
      });
      if (res.data.errCode === 0) {
        res.data.data.forEach(ele => {
          dataList.forEach(inner => {
            if (inner.exhibitId === ele.exhibitId) {
              inner.totalItem = ele.totalItem
            }
          })
        })
      } else {
        console.warn(res.data)
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.program-list {
  .program-list-wrapper-mobile {
    .plw-header {
      padding: 30px 15px;
      height: 40px;
      font-weight: 400;
      font-size: 34px;
      color: #ffffff;
      line-height: 40px;
      opacity: 0.6;
      span {
        margin-left: 12px;
      }
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
              color: #ffffff;
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
                border-top-color: #ffffff;
                position: relative;
                top: 3px;
              }
            }
          }
          .drop-list {
            position: absolute;
            top: 25px;
            width: 240px;
            background: rgba(0, 0, 0);
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 5px 0px;
            z-index: 2;
            backdrop-filter: blur(25px);
            .drop-item {
              padding-left: 20px;
              height: 50px;
              line-height: 50px;
              color: rgba(255, 255, 255, 0.6);
              &:hover {
                background-color: #2784ff;
                color: #ffffff;
              }
              &.selected {
                color: rgba(255, 255, 255, 1);
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
        color: #FFFFFF;
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
      color: #ffffff;
      line-height: 56px;
      opacity: 0.6;
      span {
        margin-left: 12px;
      }
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
              color: #ffffff;
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
                border-top-color: #ffffff;
                position: relative;
                top: 3px;
              }
            }
          }
          .drop-list {
            position: absolute;
            top: 25px;
            width: 240px;
            background: rgba(0, 0, 0);
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 5px 0px;
            z-index: 2;
            backdrop-filter: blur(25px);
            .drop-item {
              padding-left: 20px;
              height: 50px;
              line-height: 50px;
              color: rgba(255, 255, 255, 0.6);
              &:hover {
                background-color: #2784ff;
                color: #ffffff;
              }
              &.selected {
                color: rgba(255, 255, 255, 1);
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
}
</style>
