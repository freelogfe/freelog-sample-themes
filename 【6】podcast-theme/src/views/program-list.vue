<template>
  <div class="program-list-wrapper">
    <div class="plw-header">
      <label>所有节目</label>
      <span>(7)</span>
    </div>
    <div v-if="hotList.length" class="plw-body">
      <div class="plw-condition">
        <div class="left" v-clickOutside="dropDownShow">
          <div class="wrapper" @click="dropDownShow.value = !dropDownShow.value">
            <span class="txt">最近更新</span>
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
      nodeInfo: {}
    };
  },
  created() {
    this.nodeInfo = freelogApp.nodeInfo;
    this.getList();
  },
  computed: {
    hotList() {
      return JSON.parse(JSON.stringify(this.listData.slice()));
    }
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
      console.log(dataList);
      this.listData = dataList;
      this.total = totalItem;
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.program-list-wrapper {
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
</style>
