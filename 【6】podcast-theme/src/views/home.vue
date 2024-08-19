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

      <div class="hot-wrapper" v-if="!loading && total">
        <div class="hot-header">
          <div class="hot-title">热门节目</div>
          <div class="hot-more" @click="$router.myPush('/program-list')">
            <span class="text">所有节目</span>
            <span class="freelog fl-icon-zhankaigengduo"></span>
          </div>
        </div>
        <div class="hot-body">
          <div class="hot-container">
            <program :data="item" v-for="item in hotList" :key="item.exhibitId"></program>
            <div class="all-programs">
              <div class="content">
                <div class="circle" @click="$router.myPush('/program-list')">
                  <span class="freelog fl-icon-zhankaigengduo"></span>
                </div>
                <div class="desc" @click="$router.myPush('/program-list')">查看全部节目</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template v-if="!loading">
        <div class="content-area" v-if="total">
          <div class="content-top">
            <div class="top-title">最近更新</div>
          </div>
          <div class="voice-list">
            <voice :data="item" v-for="item in lastestList" :key="`${item.exhibitId}-${item.child ? item.child.itemId : ''}`" mode="voice" />
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

      <!-- 热门节目 -->
      <div class="hot-wrapper" v-if="!loading && total">
        <div class="hot-header">
          <div class="hot-title">热门节目</div>
          <div class="hot-more" @click="$router.myPush('/program-list')">
            <span class="text">所有节目</span>
            <span class="freelog fl-icon-zhankaigengduo"></span>
          </div>
        </div>
        <div class="hot-body">
          <div class="hot-container">
            <program :data="item" v-for="item in hotList" :key="item.exhibitId"></program>
          </div>
        </div>
      </div>

      <template v-if="!loading">
        <div class="content-area" v-if="total">
          <div class="content-top">
            <div class="top-title">最近更新</div>
          </div>
          <div class="voice-list">
            <voice :data="item" v-for="item in lastestList" :key="`${item.exhibitId}-${item.child ? item.child.itemId : ''}`" mode="voice" />
          </div>
        </div>

        <div class="no-data-tip" v-else>当前节点暂无任何声音，请稍后查看</div>
      </template>

      <template v-else>
        <el-skeleton animated>
          <template slot="template">
            <div class="pc-skeleton-hot">
              <el-skeleton-item class="hot-title" variant="text" />
              <el-skeleton-item class="hot-others" variant="text" />
            </div>
          </template>
        </el-skeleton>
        <el-skeleton animated>
          <template slot="template">
            <div class="pc-skeleton">
              <div class="program-skeleton" v-for="item in 5" :key="item">
                <el-skeleton-item class="program-cover" variant="image" />
                <el-skeleton-item class="program-desc" variant="text" />
                <el-skeleton-item class="program-others" variant="text" />
              </div>
            </div>
          </template>
        </el-skeleton>
        <el-skeleton class="skeleton" animated>
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
      </template>

    </div>
  </div>
</template>

<script>
import voice from "@/components/voice";
import program from "@/components/program";
import { freelogApp } from "freelog-runtime";
import Vue from "vue";
import { sleep } from "../utils/common";

export default {
  name: "home",

  components: {
    voice,
    program
  },

  data() {
    return {
      listData: [],
      loading: false,
      total: 0,
      nodeInfo: {},
      nodeInfoPopupShow: false,
      lastestList: []
    };
  },

  watch: {
    "$store.state.lastestAuthList"(cur) {
      cur.forEach(ele => {
        // 更新热门节目
        const item = this.listData.find(data => data.exhibitId === ele.exhibitId);
        if (item) item.defaulterIdentityType = ele.defaulterIdentityType;

        // 更新最新更新
        const items = this.lastestList.filter(data => data.exhibitId === ele.exhibitId)
        if (items.length) {
          for (const item of items) {
            item.defaulterIdentityType = ele.defaulterIdentityType;
          }
        }
      });
    }
  },

  computed: {
    /** 自定义配置 */
    selfConfig() {
      return this.$store.state.selfConfig;
    },
    hotList() {
      const data = this.listData
        .filter(ele => ele.articleInfo.articleType === 2)
        .concat(this.listData.filter(ele => ele.articleInfo.articleType !== 2));
      return JSON.parse(JSON.stringify(data.slice(0, 5)));
    }
  },

  created() {
    this.nodeInfo = freelogApp.nodeInfo;
    this.getList().then((res) => {
      if (!res.length) return
      this.getUpdatedList(res);
    })
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
    this.$store.dispatch("updateLastestAuthList")
  },

  deactivated() {
    const app = document.getElementById("app");
    app.removeEventListener("scroll", this.scroll);
  },

  methods: {
    /** 获取展品列表 */
    async getUpdatedList(list) {
      const top = 10
      const allexhibitIds = list.map(ele => ele.exhibitId).join(',')
      const exhibitIds = list.filter(ele => ele.articleInfo.articleType === 2).map(ele => ele.exhibitId).join(',')
      const [exhibitDetailList, authStatusList, exhibitSubList] = await Promise.all([
        freelogApp.getExhibitListById({ exhibitIds: allexhibitIds, isLoadVersionProperty: 1 }),
        freelogApp.getExhibitAuthStatus(allexhibitIds),
        freelogApp.getCollectionsSubList(exhibitIds, {
          sortType: -1, 
          skip: 0,
          limit: 10,
          isShowDetailInfo: 1, 
        })
      ])

      if (exhibitDetailList.data.errCode !== 0) {
        console.warn(exhibitDetailList.data)
      }
      if (authStatusList.data.errCode !== 0) {
        console.warn(authStatusList.data)
      }
      if (exhibitSubList.data.errCode !== 0) {
        console.warn(exhibitSubList.data)
      }
      
      // 合集内的子作品: 扁平化处理
      const flatSubList = []
      exhibitSubList.data.data.forEach(ele => {
        const exhibitDetail = exhibitDetailList.data.data.find(exhibit => exhibit.exhibitId === ele.exhibitId)
        const authItem = authStatusList.data.data.find(exhibit => exhibit.exhibitId === ele.exhibitId)
        if (ele.itemList && ele.itemList.length) {
          ele.itemList.forEach(innerEle => {
            const data = JSON.parse(JSON.stringify({
              ...exhibitDetail,
              child: innerEle,
              defaulterIdentityType: authItem.defaulterIdentityType
            }))
            flatSubList.push(data)
          })
        } else {
          // const data = JSON.parse(JSON.stringify({
          //   ...exhibitDetail,
          //   defaulterIdentityType: authItem.defaulterIdentityType,
          // }))
          // flatSubList.push(data)
        }

        // 热门节目的子作品数量
        this.listData.forEach((innerEle, index) => {
          if (innerEle.exhibitId === ele.exhibitId) {
            Vue.set(this.listData[index], "totalItem", ele.totalItem)
          }
        })
      })

      // 非合集数据
      const notExhibitList = []
      const notExhibitIds = list.filter(ele => ele.articleInfo.articleType === 1).map(ele => ele.exhibitId)
      notExhibitIds.forEach(ele => {
        const exhibitDetail = exhibitDetailList.data.data.find(exhibit => exhibit.exhibitId === ele)
        const authItem = authStatusList.data.data.find(exhibit => exhibit.exhibitId === ele)
        const data = {
          ...exhibitDetail,
          defaulterIdentityType: authItem.defaulterIdentityType,
        }
        notExhibitList.push(data)
      })

      // 合集内的子作品: 排序后取前top
      const sortedflatSubListTop = flatSubList.sort((a, b) => {
        const aTimeStamp = new Date(a.child.createDate).getTime()
        const bTimeStamp = new Date(b.child.createDate).getTime()
        return bTimeStamp - aTimeStamp
      }).slice(0, top)

      // 非合集数据: 排序后取前top
      const sortedNotExhibitListTop = notExhibitList.sort((a, b) => {
        const aTimeStamp = new Date(a.updateDate).getTime()
        const bTimeStamp = new Date(b.updateDate).getTime()
        return bTimeStamp - aTimeStamp
      }).slice(0, top)
      

      const result = [].concat(sortedflatSubListTop, sortedNotExhibitListTop).sort((a, b) => {
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
        return bTimeStamp - aTimeStamp
      }).slice(0, top)

      this.lastestList = result
    },
    /** 获取展品列表 */
    async getList() {
      if (this.loading) return;

      this.loading = true;
      await sleep(800)
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
      return dataList
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
        margin-top: 50px;
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

    .hot-wrapper {
      margin-top: 10px;
      .hot-header {
        height: 28px;
        display: flex;
        margin-bottom: 25px;
        padding: 0 15px;
        .hot-title {
          font-weight: 600;
          font-size: 20px;
          color: #ffffff;
          line-height: 28px;
          margin-right: auto;
          opacity: 0.6;
        }
        .hot-more {
          align-self: flex-end;
          display: flex;
          align-items: center;
          cursor: pointer;
          opacity: 0.6;
          &:hover {
            opacity: 1;
          }
          .text {
            height: 20px;
            font-weight: 600;
            font-size: 14px;
            color: #ffffff;
            line-height: 20px;
          }
          .freelog {
            font-size: 12px;
            margin-left: 5px;
          }
        }
      }

      .hot-container {
        display: flex;
        gap: 20px;
        padding: 0px 15px;
        overflow: auto;
        scrollbar-width: none;
        &::-webkit-scrollbar { 
          display: none;
        }

        .all-programs {
          flex-shrink: 0;
          width: 210px;
          height: 210px;
          background: #222222;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          .content {
            display: flex;
            align-items: center;
            flex-direction: column;
            height: 98px;
            .circle {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.05);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              &:active {
                background: rgba(255, 255, 255, 0.03);

              }
              span {
                color: #FFFFFF;
                opacity: 0.6;
                font-size: 24px;
                text-align: center;
                line-height: 48px;
                &:active {
                  opacity: 0.4;
                }
              }
            }
            
            .desc {
              margin-top: auto;
              font-weight: 600;
              font-size: 14px;
              color: #FFFFFF;
              line-height: 20px;
              opacity: 0.6;
              cursor: pointer;
              &:active {
                opacity: 0.4;
              }
            }
          }
        }
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

        // .view-all-btn {
        //   color: rgba(255, 255, 255, 0.6);
        //   display: flex;
        //   align-items: center;
        //   cursor: pointer;
        //   transition: all 0.2s linear;

        //   &:hover {
        //     color: #2784ff;
        //   }

        //   &:active {
        //     color: rgba(39, 132, 255, 0.8);
        //   }

        //   .btn-label {
        //     font-size: 14px;
        //     font-weight: 600;
        //     line-height: 20px;
        //   }

        //   .freelog {
        //     font-size: 7px;
        //     margin-left: 5px;
        //   }
        // }
      }

      .voice-list {
        .voice-wrapper + .voice-wrapper {
          margin-top: 25px;
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

    .pc-skeleton {
      display: flex;
      gap: 20px;
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
    ::v-deep .el-skeleton.is-animated .el-skeleton__item {
      background: linear-gradient(
          90deg,
          rgb(70, 70, 70) 25%,
          rgb(50, 50, 50) 37%,
          rgb(70, 70, 70) 63%
        )
        0% 0% / 400% 100%;
    }

    .pc-skeleton-hot {
      display: flex;
      margin-bottom: 25px;
      margin-top: 45px;
      .hot-title {
        width: 80px;
        height: 28px;
        margin-right: auto;
      }
      .hot-others {
        height: 20px;
        width: 40px;
      }
    }

    .hot-wrapper {
      margin-top: 45px;
      .hot-header {
        height: 28px;
        display: flex;
        margin-bottom: 25px;
        .hot-title {
          font-weight: 600;
          font-size: 20px;
          color: #ffffff;
          line-height: 28px;
          margin-right: auto;
          opacity: 0.6;
        }
        .hot-more {
          align-self: flex-end;
          display: flex;
          align-items: center;
          cursor: pointer;
          opacity: 0.6;
          &:hover {
            opacity: 1;
          }
          .text {
            height: 20px;
            font-weight: 600;
            font-size: 14px;
            color: #ffffff;
            line-height: 20px;
          }
          .freelog {
            font-size: 12px;
            margin-left: 5px;
          }
        }
      }

      .hot-container {
        display: flex;
        gap: 20px;
      }
    }
  }
}
</style>
