<!-- 首页 -->

<template>
  <div class="home-wrapper" @click="sortPopupShow = false">

    <!-- mobile -->
    <div class="mobile-home-banner" v-if="inMobile">
      <div class="header-other-info">
        <div class="blogger-avatar" v-if="banner">
          <img :src="banner" alt="博客banner" class="avatar-img" />
        </div>
      </div>

      <div class="header-blog-info">
        <div class="blog-title" v-if="nodeTitle" @click="blogInfoPopupShow = true">{{ nodeTitle }}</div>
        <div class="blog-desc" v-if="nodeShortDescription" v-html="nodeShortDescription" @click="blogInfoPopupShow = true"></div>
        <div class="tags" :class="{ 'margin-top0': !nodeTitle && !nodeShortDescription }">
          <div
            class="category-btn"
            :class="{ disabled: myLoading }"
            v-for="item in tagsList"
            :key="item"
            @click="selectTag(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
      <transition name="fade">
        <div class="blog-info-popup" @click="blogInfoPopupShow = false" v-if="blogInfoPopupShow">
          <div class="blog-title">{{ nodeTitle }}</div>
          <div class="blog-desc" v-html="nodeShortDescription"></div>
        </div>
      </transition>
    </div>

    <div class="mobile-home-body" v-if="inMobile">
      <div class="header">
        <div
          class="sort"
          :class="{ disabled: myLoading }"
          v-if="!searchData.keywords"
          @click.stop="sortPopupShow = true"
        >
          {{ createDateSortType === "-1" ? "最近" : "最早" }}
          <i class="freelog fl-icon-zhankaigengduo"></i>

          <transition name="slide-down-scale">
            <div class="sort-popup" @click.stop v-show="sortPopupShow">
              <div class="sort-popup-body">
                <div
                  class="user-box-btn"
                  @click="
                    sort('-1');
                    sortPopupShow = false;
                  "
                >
                  最近
                </div>
                <div
                  class="user-box-btn"
                  @click="
                    sort('1');
                    sortPopupShow = false;
                  "
                >
                  最早
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <my-loader v-if="loading" />

      <template v-if="!loading">
        <div class="article-list">
          <my-article-v2 :data="item" v-for="item in availableListData" :key="item.exhibitId" />
        </div>
        <div className="tip" v-show="total === 0 || availableListData.length === 0">当前节点暂无任何数据，请稍后查看</div>
        <div className="tip no-more" v-show="listData.length !== 0 && listData.length === total">— 已加载全部 —</div>
      </template>
    </div>

    <!-- PC -->
    <div class="home-body" v-if="!inMobile">
      <template v-if="$route.path === '/home' && (banner || nodeTitle || nodeShortDescription || tagsList.length)">
        <!-- 博客信息 -->
        <div class="header-blog-info" :class="{ 'withoutTitleBg': !banner && !nodeTitle }">
          <div class="blogger-avatar" v-if="banner">
            <img :src="banner" alt="博客banner" class="avatar-img" />
          </div>

          <div class="info-content" :class="{ noBg: !banner }">
            <div class="title-signcount" v-if="nodeTitle">
              <div class="blog-title" :title="nodeTitle">{{ nodeTitle }}</div>
              <!-- <div class="sign-count">总签约量：{{ signCount }}人</div> -->
            </div>
            <div class="blog-desc" v-if="nodeShortDescription" v-html="nodeShortDescriptionComputed" :title="nodeShortDescription"></div>
            <div class="tags" :class="{ 'margin-top0': !nodeTitle && !nodeShortDescription }">
              <div
                class="category-btn"
                :class="{ disabled: myLoading }"
                v-for="item in tagsList"
                :key="item"
                @click="selectTag(item)"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <div class="model"></div>
        </div>
      </template>

      <div class="header" v-if="!searchData.keywords && listData.length">
        <div
          class="sort"
          :class="{ disabled: myLoading }"
          @mouseover="sortPopupShow = true"
          @mouseleave="sortPopupShow = false"
        >
          {{ createDateSortType === "-1" ? "最近更新" : "最早发布" }}
          <i class="freelog fl-icon-zhankaigengduo"></i>

          <transition name="slide-down-scale">
            <div class="sort-popup" v-show="sortPopupShow">
              <div class="sort-popup-body">
                <div class="user-box-btn" @click="sort('-1')">最近更新</div>
                <div class="user-box-btn" @click="sort('1')">最早发布</div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <my-loader v-if="loading" />

      <template v-if="!loading">
        <div class="article-list">
          <my-article-v2 :data="item" v-for="item in availableListData" :key="item.exhibitId" />
        </div>
        <div className="tip" v-show="total === 0 || availableListData.length === 0">当前节点暂无任何数据，请稍后查看</div>
        <div className="tip no-more" v-show="listData.length !== 0 && listData.length === total">— 已加载全部 —</div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, onActivated, onDeactivated, reactive, toRefs, watch, computed } from "vue";
import { useGetList, useMyRouter, useMyScroll } from "../utils/hooks";
import { useStore } from "vuex";
import { freelogApp } from "freelog-runtime";

export default {
  name: "home",

  components: {
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    "my-article-v2": defineAsyncComponent(() => import("../components/article-v2.vue")),
  },

  setup() {
    const nodeInfo = freelogApp.nodeInfo;
    console.log("nodeInfo", nodeInfo);
    
    const store = useStore();
    const tagsList: string[] = store.state.selfConfig.tags?.split(",")?.filter((ele: string) => ele);
    const { query, route, router, switchPage } = useMyRouter();
    const { scrollTop, clientHeight, scrollHeight, scrollTo } = useMyScroll();
    const datasOfGetList = useGetList();
    
    const data = reactive({
      sortPopupShow: false,
      createDateSortType: "-1",
      searchData: { sort: "createDate:-1" } as { keywords?: string; tags?: string; sort?: string },
      blogInfoPopupShow: false,
      isInitial: true
    });

    const banner = computed(() => {
      return store.state.selfConfig.options_banner
    })

    const inMobile = computed(() => {
      return store.state.inMobile
    })

    const availableListData = computed(() => {
      return datasOfGetList.listData.value.filter((ele: any) => ele.articleInfo.status === 1 && [0, 4].includes(ele.defaulterIdentityType!)) 
    })

    const nodeShortDescriptionComputed = computed(() => {
      
      return nodeInfo.nodeShortDescription?.replaceAll('\n', '<br />')
    })

    const methods = {
      /** 排序 */
      sort(sortType: string) {
        if (data.createDateSortType === sortType) return;

        data.createDateSortType = sortType;
        data.searchData.sort = `createDate:${sortType}`;
        datasOfGetList.getList(data.searchData, true);
      },

      /** 清除搜索 */
      clearSearch() {
        data.searchData = { sort: "createDate:-1" };
        switchPage("/home");
      },

      /** 筛选标签, 跳转搜索结果页 */
      selectTag(tag: string) {
        const { keywords } = data.searchData;
        const query: { keywords?: string; tags?: string } = {};
        if (tag) query.tags = tag;
        if (keywords) query.keywords = keywords;
        switchPage("/search", query);
      },
    };

    watch(
      () => scrollTop.value,
      (cur) => {
        if (cur + clientHeight.value === scrollHeight.value) {
          datasOfGetList.getList();
        }
      }
    );

    watch(
      () => query.value,
      () => {
        if (route.path !== "/home") return;
        if (data.searchData.keywords === query.value.keywords && data.searchData.tags === query.value.tags) return;

        getData();
      }
    );

    /** 获取展品列表 */
    const getData = () => {
      data.searchData = { ...query.value, sort: data.searchData.sort };
      datasOfGetList.clearData();
      datasOfGetList.getList(data.searchData, true);
    };

    onActivated(() => {
      if (router.options.history.state.replaced && !data.isInitial) {
        const homeScrollTop = sessionStorage.getItem("homeScroll");
        scrollTo(Number(homeScrollTop), "auto");

        const { authIds } = store.state;
        if (authIds.length === 0) return;

        authIds.forEach((id: string) => {
          const index = datasOfGetList.listData.value.findIndex((item) => item.exhibitId === id);
          if (index !== -1) datasOfGetList.listData.value[index].defaulterIdentityType = 0;
        });
        store.commit("setData", { key: "authIds", value: [] });
      } else {
        getData();
      }

      data.isInitial = false
    });

    onDeactivated(() => {
      sessionStorage.setItem("homeScroll", String(scrollTop.value));
    });

    getData();

    return {
      ...nodeInfo,
      tagsList,
      ...datasOfGetList,
      ...toRefs(data),
      ...methods,
      banner,
      inMobile,
      availableListData,
      nodeShortDescriptionComputed
    };
  },
};
</script>

<style lang="scss" scoped>
.home-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  // mobile
  .mobile-home-banner {
    width: 100%;
    .header-other-info {
      width: 100%;
      .blogger-avatar {
        width: 100%;
        height: calc((100vw - 0px) * 0.44);
        box-sizing: border-box;

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .header-blog-info {
      background-color: #F7F7F7;
      padding: 20px;

      .blog-title {
        font-size: 30px;
        font-weight: 600;
        color: #222222;
        line-height: 36px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .blog-desc {
        font-weight: 400;
        font-size: 14px;
        color: #222222;
        line-height: 20px;
        margin-top: 15px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 2px 10px;
        margin-top: 15px;

        &.margin-top0 {
          margin-top: 0px;
        }

        .category-btn {
          position: relative;
          padding: 2px 8px;
          box-sizing: border-box;
          font-size: 14px;
          color: #aaa;
          line-height: 20px;
          border-radius: 12px;
          border: 1px solid #aaa;;
          margin-bottom: 2px;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            opacity: 0.7;
          }

          &:active {
            opacity: 0.7;
          }
        }
      }
    }

    .blog-info-popup {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      padding: 30px 20px;
      box-sizing: border-box;
      overflow-y: auto;
      z-index: 1;

      .blog-title {
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
        line-height: 30px;
      }

      .blog-desc {
        font-size: 14px;
        color: #ffffff;
        line-height: 20px;
        margin-top: 20px;
      }
    }

  }

  .mobile-home-body {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    padding-bottom: 188px;

    .header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);

      .sort {
        position: relative;
        font-size: 16px;
        line-height: 22px;
        display: flex;
        align-items: center;

        .freelog {
          font-size: 12px;
          width: 12px;
          height: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 5px;
          transform: rotate(90deg);
        }

        .sort-popup {
          position: absolute;
          left: 0;
          top: 100%;
          padding-top: 5px;
          z-index: 1;

          .sort-popup-body {
            width: 118px;
            background: #ffffff;
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            padding: 10px 0;

            .user-box-btn {
              width: 100%;
              height: 40px;
              padding: 0 20px;
              box-sizing: border-box;
              font-size: 14px;
              line-height: 40px;
              cursor: pointer;
            }
          }
        }
      }

      .box-title {
        font-size: 16px;
        color: #999999;
        line-height: 22px;
      }

      .text-btn {
        display: flex;
        align-items: center;

        .freelog {
          font-size: 18px;
        }

        .filter-label {
          font-size: 16px;
          line-height: 22px;
          margin-left: 5px;
        }
      }
    }

    .tip {
      width: 100%;
      text-align: center;
      font-size: 16px;
      line-height: 22px;
      color: #999;
      margin-top: 55px;

      &.no-more {
        font-size: 14px;
        line-height: 20px;
        margin: 50px 0;
      }
    }

    .modal {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      z-index: 101;
    }

    .filter-box-body {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 340px;
      background: #ffffff;
      border-radius: 0px 10px 10px 0px;
      padding: 0 20px;
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      z-index: 101;

      .filter-box-header {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 26px;

        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: #222222;
          line-height: 22px;
        }

        .close-btn {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 6px;

          .freelog {
            font-size: 12px;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .tags-box {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-top: 30px;
        padding-left: 12px;
        box-sizing: border-box;

        .tags-box-list {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        .tag {
          width: fit-content;
          height: 38px;
          border-radius: 38px;
          padding: 9px 15px;
          box-sizing: border-box;
          background: #ebecf0;
          font-size: 14px;
          color: #575e6a;
          line-height: 20px;
          margin: 0 5px 15px;
          cursor: pointer;

          &.active {
            background-color: #0F2027;
            color: #fff;
          }
        }
      }
    }
    .article-list {
      .article-wrapper-v2 {
        margin-bottom: 30px;
      }
      .article-wrapper-v2:last-child {
        border-bottom: none;
        margin-bottom: 0px;
      }
    }
  }

  // PC
  .home-body {
    width: 90%;
    min-width: 965px;
    max-width: 1600px;
    padding-bottom: 48px;

    .header-blog-info {
      position: relative;
      min-height: 314px;
      overflow: hidden;
      
      &.withoutTitleBg {
        min-height: 100px;
      }

      .blogger-avatar {
        width: 100%;
        aspect-ratio: 16 / 7;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .model {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;
        height: 100%;
        width: 100%;
        border-radius: 10px;
        background-image: linear-gradient( 180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
      }

      .info-content {
        box-sizing: border-box;
        width: calc(100% - 50px);
        position: absolute;
        left: 50px;
        top: 335px;
        height: fit-content;
        padding-right: 50px;
        z-index: 1;

        &.noBg {
          top: 50%;
          left: 0px;
          transform: translateY(-50%);

          .blog-title {
            color: #222222 !important;
          }

          .blog-desc {
            color: #222 !important;
          }

          .category-btn {
            color: #666666 !important;
            border-color: #666666 !important;
          }

        }

        .title-signcount {
          width: 100%;
          display: flex;
          align-items: center;

          .blog-title {
            height: 84px;
            max-width: 100%;
            font-size: 60px;
            font-weight: 600;
            line-height: 84px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: #FFFFFF;
          }

          .sign-count {
            flex-shrink: 0;
            height: 28px;
            line-height: 28px;
            padding: 0 8px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
            margin-left: 15px;
          }
        }

        .blog-desc {
          font-size: 20px;
          color: #fff;
          line-height: 28px;
          margin-top: 20px;
          // display: -webkit-box;
          // -webkit-box-orient: vertical;
          // -webkit-line-clamp: 2;
          // overflow: hidden;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          height: 26px;
          overflow: hidden;
          margin-top: 30px;

          &.margin-top0 {
            margin-top: 0px;
          }

          .category-btn {
            flex-shrink: 0;
            position: relative;
            padding: 2px 8px;
            box-sizing: border-box;
            font-size: 14px;
            color: #fff;
            line-height: 20px;
            border-radius: 12px;
            border: 1px solid #FFFFFF;;
            margin-bottom: 2px;
            cursor: pointer;
            transition: all 0.2s linear;
            z-index: 1;
  
            &:hover {
              opacity: 0.7;
            }
  
            &:active {
              opacity: 0.7;
            }
  
            & + .category-btn {
              margin-left: 10px;
            }
          }
        }

      }
    }

    .header {
      font-size: 30px;
      line-height: 36px;
      padding: 40px 0px;

      .sort {
        position: relative;
        width: fit-content;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 600;
        color: #222222;
        line-height: 20px;
        cursor: pointer;

        .freelog {
          font-size: 12px;
          width: 12px;
          height: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 5px;
          transform: rotate(90deg);
        }

        .sort-popup {
          position: absolute;
          left: 0;
          top: 100%;
          padding-top: 5px;
          z-index: 1;

          .sort-popup-body {
            width: 118px;
            background: #ffffff;
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            padding: 10px 0;

            .user-box-btn {
              width: 100%;
              height: 40px;
              padding: 0 20px;
              box-sizing: border-box;
              font-size: 14px;
              line-height: 40px;
              cursor: pointer;
            }
          }
        }
      }
    }

    .article-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
    }

    .tip {
      width: 100%;
      text-align: center;
      font-size: 16px;
      line-height: 22px;
      color: #999;
      margin-top: 55px;

      &.no-more {
        font-size: 14px;
        line-height: 20px;
        margin: 100px 0px;
      }
    }
  }
}

@media screen and (min-width: 1300px) {
  .article-list {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
</style>
