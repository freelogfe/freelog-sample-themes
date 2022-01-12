<template>
  <div class="home-wrapper">
    <my-header @openDirectory="directoryShow = true" />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile">
      <!-- 内容区域 -->
      <div class="content-area">
        <my-markdown :data="documentData" @getDirectory="getDirectory($event)" v-if="documentData.isAuth === true" />
        <div class="lock-box" v-if="documentData.isAuth === false">
          <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
          <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
          <div class="get-btn" @click="getAuth(documentData)">签约</div>
        </div>

        <div class="footer-area">
          <div class="footer-bar">
            <div>最近更新 {{ relativeTime(documentData?.updateDate) }}</div>
            <div class="divider"></div>
            <div>签约量 {{ documentData?.signCount }}</div>
            <div class="divider"></div>
            <div>作者 {{ documentData?.articleInfo?.articleOwnerName }}</div>
          </div>

          <div class="switch-btns" v-if="listData.length && currentIndex !== -1">
            <div
              class="switch-btn pre"
              :class="{ invalid: !currentIndex }"
              :title="currentIndex ? listData[currentIndex - 1].exhibitName : ''"
              @click="switchPage('/home', { id: listData[currentIndex - 1].exhibitId })"
            >
              <i class="freelog fl-icon-fangxiang"></i>
              <div class="btn-info">
                <div class="btn-title">上一篇</div>
                <div class="document-title">
                  {{ currentIndex ? listData[currentIndex - 1].exhibitName : "当前为第一篇" }}
                </div>
              </div>
            </div>
            <div
              class="switch-btn next"
              :class="{ invalid: currentIndex === listData.length - 1 }"
              :title="currentIndex !== listData.length - 1 ? listData[currentIndex + 1].exhibitName : ''"
              @click="switchPage('/home', { id: listData[currentIndex + 1].exhibitId })"
            >
              <div class="btn-info">
                <div class="btn-title">下一篇</div>
                <div class="document-title">
                  {{ currentIndex !== listData.length - 1 ? listData[currentIndex + 1].exhibitName : "当前为最后一篇" }}
                </div>
              </div>
              <i class="freelog fl-icon-fangxiang"></i>
            </div>
          </div>
        </div>

        <my-footer />
      </div>

      <!-- 目录 -->
      <transition name="fade">
        <div id="modal" class="modal" @click="directoryShow = false" v-if="directoryShow"></div>
      </transition>
      <transition name="slide-right">
        <div class="directory" v-if="directoryShow">
          <div class="directory-sticky">
            <div class="drawer-header">
              <div class="header-title">文档目录</div>
              <i class="freelog fl-icon-guanbi" @click="directoryShow = false"></i>
            </div>

            <!-- 搜索框 -->
            <div class="search-box">
              <div class="input-box">
                <input
                  class="search-input"
                  v-model="searchKey"
                  placeholder="输入文档名称或关键字"
                  @keyup.enter="search()"
                  @keyup.esc="searchKey = ''"
                />
                <i class="freelog fl-icon-content"></i>
              </div>

              <div class="search-tip" v-show="searching">
                <div class="tip">查询到{{ listData.length }}个相关结果</div>
                <div class="clear-btn" @click="clearSearch()">清空</div>
              </div>
            </div>
          </div>

          <div
            class="list-item"
            :class="{ active: currentId === item.exhibitId }"
            v-for="item in listData"
            :key="item.exhibitId"
            @click="
              switchPage('/home', { id: item.exhibitId });
              directoryShow = false;
            "
          >
            <div class="item-title" :title="item.exhibitName">
              {{ item.exhibitName }}
            </div>
            <img
              class="item-lock"
              src="../assets/images/mini-lock.png"
              title="授权"
              @click.stop="getAuth(item)"
              v-if="!item.isAuth"
            />
          </div>
        </div>
      </transition>

      <div class="back-top">
        <back-top>
          <div class="fixed-btn">
            <i class="freelog fl-icon-huidaodingbu"></i>
          </div>
        </back-top>
      </div>
    </div>

    <!-- PC -->
    <div class="home-body" @click="sharePopupShow = false" v-if="!inMobile">
      <!-- 列表条 -->
      <div class="list-bar" :class="{ large: !directoryList.length }">
        <!-- 搜索框 -->
        <div class="search-box">
          <div class="input-box">
            <input
              class="search-input"
              v-model="searchKey"
              placeholder="输入文档名称或关键字"
              @keyup.enter="search()"
              @keyup.esc="searchKey = ''"
            />
            <i class="freelog fl-icon-content"></i>
          </div>

          <div class="search-tip" v-show="searching">
            <div class="tip">查询到{{ listData.length }}个相关结果</div>
            <div class="clear-btn" @click="clearSearch()">清空</div>
          </div>
        </div>

        <div
          class="list-item"
          :class="{ active: currentId === item.exhibitId }"
          v-for="item in listData"
          :key="item.exhibitId"
          @click="switchPage('/home', { id: item.exhibitId })"
        >
          <div class="item-title" :title="item.exhibitName">
            {{ item.exhibitName }}
          </div>
          <img
            class="item-lock"
            src="../assets/images/mini-lock.png"
            title="授权"
            @click.stop="getAuth(item)"
            v-if="!item.isAuth"
          />
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area" :class="{ large: !directoryList.length }">
        <div class="content-body">
          <my-markdown :data="documentData" @getDirectory="getDirectory($event)" v-if="documentData.isAuth === true" />
          <div class="lock-box" v-if="documentData.isAuth === false">
            <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth(documentData)">签约</div>
          </div>

          <div class="footer-area">
            <div class="footer-bar">
              <div>最近更新 {{ relativeTime(documentData?.updateDate) }}</div>
              <div class="divider"></div>
              <div>签约量 {{ documentData?.signCount }}</div>
              <div class="divider"></div>
              <div>作者 {{ documentData?.articleInfo?.articleOwnerName }}</div>
            </div>

            <div class="switch-btns" v-if="listData.length && currentIndex !== -1">
              <div
                class="switch-btn pre"
                :class="{ invalid: !currentIndex }"
                :title="currentIndex ? listData[currentIndex - 1].exhibitName : ''"
                @click="switchPage('/home', { id: listData[currentIndex - 1].exhibitId })"
              >
                <i class="freelog fl-icon-fangxiang"></i>
                <div class="btn-info">
                  <div class="btn-title">上一篇</div>
                  <div class="document-title">
                    {{ currentIndex ? listData[currentIndex - 1].exhibitName : "当前为第一篇" }}
                  </div>
                </div>
              </div>
              <div
                class="switch-btn next"
                :class="{ invalid: currentIndex === listData.length - 1 }"
                :title="currentIndex !== listData.length - 1 ? listData[currentIndex + 1].exhibitName : ''"
                @click="switchPage('/home', { id: listData[currentIndex + 1].exhibitId })"
              >
                <div class="btn-info">
                  <div class="btn-title">下一篇</div>
                  <div class="document-title">
                    {{
                      currentIndex !== listData.length - 1 ? listData[currentIndex + 1].exhibitName : "当前为最后一篇"
                    }}
                  </div>
                </div>
                <i class="freelog fl-icon-fangxiang"></i>
              </div>
            </div>
          </div>

          <my-footer />
        </div>
      </div>

      <!-- 标题目录区域 -->
      <div class="title-directory" v-if="directoryList.length">
        <div
          class="directory-item"
          :class="{
            active: currentTitleIndex === index,
            second: item.nodeName === 'H2',
            third: item.nodeName === 'H3',
          }"
          :title="item.innerText"
          v-for="(item, index) in directoryList"
          :key="item.id"
          @click="jumpToTitle(item.id)"
        >
          <span>{{ item.innerText }}</span>
        </div>
      </div>

      <div class="fixed-btns">
        <div class="fixed-btn" @click.stop="sharePopupShow = true">
          <share :show="sharePopupShow" :exhibit="documentData" />
          <i class="freelog fl-icon-fenxiang"></i>
        </div>

        <div class="back-top">
          <back-top>
            <div class="fixed-btn">
              <i class="freelog fl-icon-huidaodingbu"></i>
            </div>
          </back-top>
        </div>
      </div>

      <theme-entrance />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, onUnmounted, reactive, toRefs, watch } from "vue";
import { useStore } from "vuex";
import { useGetList, useMyRouter, useMyScroll } from "@/utils/hooks";
import { addAuth, getExhibitFileStream, getExhibitSignCount } from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { relativeTime } from "@/utils/common";

export default {
  name: "home",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-markdown": defineAsyncComponent(() => import("../components/markdown.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    share: defineAsyncComponent(() => import("../components/share.vue")),
    "back-top": defineAsyncComponent(() => import("../components/back-top.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
  },

  setup() {
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const { scrollTop, scrollTo, scrollToTop } = useMyScroll();
    const datasOfGetList = useGetList();

    const data = reactive({
      currentId: "",
      documentData: {} as ExhibitItem,
      directoryList: [] as HTMLElement[],
      currentTitleIndex: 0,
      sharePopupShow: false,
      searchKey: "",
      searching: false,
      directoryShow: false,
    });

    const currentIndex = computed(() => {
      return datasOfGetList.listData.value.findIndex((item) => item.exhibitId === data.currentId);
    });

    const methods = {
      // 授权
      async getAuth(item: ExhibitItem) {
        const authResult = await addAuth(item.exhibitId);
        const { status } = authResult;
        if (status === 0) {
          item.isAuth = true;
          if (data.currentId === item.exhibitId) getDocumentData();
        }
      },

      // 获取目录数据
      getDirectory(directoryList: HTMLElement[]) {
        data.directoryList = directoryList;
      },

      // 跳到标题位置
      jumpToTitle(id: string) {
        const el: any = data.directoryList.find((item) => item.id === id);
        scrollTo(el.offsetTop);
      },

      // 搜索
      search() {
        const { searchKey } = data;
        const query: { sort: string; keywords?: string } = { sort: store.state.selfConfig.sort };
        if (searchKey) query.keywords = searchKey;
        datasOfGetList.getList(query, true);
      },

      // 清除搜索
      clearSearch() {
        data.searchKey = "";
        this.search();
      },
    };

    // 获取列表数据
    const getData = () => {
      datasOfGetList.getList({ sort: store.state.selfConfig.sort }, true);
    };

    // 获取文档数据
    const getDocumentData = async (id = "") => {
      const exhibitId = id || data.currentId;
      const documentData = datasOfGetList.listData.value.find((item) => item.exhibitId === exhibitId);

      if (!documentData) return;

      if (!id) {
        const signCountData = await getExhibitSignCount(exhibitId);
        documentData.signCount = signCountData.data.data[0].count;
        data.documentData = documentData;
        scrollToTop("auto");
        data.currentTitleIndex = 0;
        data.directoryList = [];
      }

      if (!documentData.isAuth) return;

      const info: any = await getExhibitFileStream(exhibitId);
      if (!info) return;
      if (!id) data.documentData.content = info.data;
    };

    const keyup = (e: KeyboardEvent) => {
      if (currentIndex.value === -1) return;

      if (e.key === "ArrowLeft" && currentIndex.value !== 0)
        switchPage("/home", { id: datasOfGetList.listData.value[currentIndex.value - 1].exhibitId });
      if (e.key === "ArrowRight" && currentIndex.value !== datasOfGetList.listData.value.length - 1)
        switchPage("/home", { id: datasOfGetList.listData.value[currentIndex.value + 1].exhibitId });
    };

    watch(
      () => datasOfGetList.listData.value,
      (cur) => {
        data.searching = !!data.searchKey;
        if (!cur.length) return;

        if (!query.value.id) {
          switchPage("/home", { id: cur[0].exhibitId });
        } else if (data.currentId !== query.value.id) {
          data.currentId = query.value.id;
          getDocumentData();
        }
      }
    );

    watch(
      () => query.value,
      (cur) => {
        if (cur && cur.id !== data.currentId) {
          data.currentId = cur.id;
          getDocumentData();
        }
      }
    );

    watch(
      () => scrollTop.value,
      (cur) => {
        data.sharePopupShow = false;

        for (let i = data.directoryList.length - 1; i >= 0; i--) {
          if (cur >= data.directoryList[i].offsetTop) {
            data.currentTitleIndex = i;
            break;
          }
        }
      }
    );

    getData();
    window.addEventListener("keyup", keyup);
    onUnmounted(() => {
      window.removeEventListener("keyup", keyup);
    });

    return {
      relativeTime,
      ...store.state,
      ...datasOfGetList,
      switchPage,
      ...toRefs(data),
      currentIndex,
      ...methods,
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
  .mobile-home-body {
    width: 100%;

    .content-area {
      position: relative;
      width: 100%;
      min-height: calc(100vh - 60px);
      padding: 0 15px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;

      .markdown-wrapper {
        margin-top: 30px;
        margin-bottom: 417px;
      }

      .lock-box {
        width: 100%;
        height: 454px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 377px;

        .lock {
          width: 64px;
          height: 64px;
          font-size: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b2b2b2;
        }

        .lock-tip {
          font-size: 16px;
          color: #222;
          line-height: 22px;
          margin-top: 40px;
        }

        .get-btn {
          padding: 9px 20px;
          border-radius: 4px;
          font-size: 14px;
          line-height: 20px;
          font-weight: bold;
          background-color: #2784ff;
          color: #fff;
          margin-top: 40px;

          &:active {
            background-color: #529dff;
          }
        }
      }

      .footer-area {
        position: absolute;
        left: 15px;
        right: 15px;
        bottom: 148px;

        .footer-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          font-size: 12px;
          line-height: 18px;
          color: #999;

          .divider {
            width: 1px;
            height: 14px;
            background: rgba(0, 0, 0, 0.15);
            margin: 0 10px;
          }
        }

        .switch-btns {
          width: 100%;
          margin-top: 40px;

          .switch-btn {
            width: 100%;
            height: 78px;
            background: #fafbfc;
            border-radius: 4px;
            border: 1px solid #e4e4e4;
            display: flex;
            align-items: center;
            padding: 15px 20px;
            box-sizing: border-box;

            & + .switch-btn {
              margin-top: 15px;
            }

            &:active {
              border: 1px solid #2784ff;

              .freelog {
                color: #2784ff;
              }
            }

            &.invalid {
              pointer-events: none;
              opacity: 0.4;
            }

            &.pre {
              .freelog {
                transform: rotate(90deg);
              }

              .btn-info {
                margin-left: 40px;
                align-items: flex-end;
              }
            }

            &.next {
              .btn-info {
                margin-right: 40px;
              }

              .freelog {
                transform: rotate(-90deg);
              }
            }

            .freelog {
              font-size: 16px;
              color: #999;
            }

            .btn-info {
              flex: 1;
              width: 0;
              display: flex;
              flex-direction: column;

              .btn-title {
                font-size: 12px;
                font-weight: 600;
                color: #999999;
                line-height: 18px;
              }

              .document-title {
                max-width: 100%;
                font-size: 14px;
                font-weight: 600;
                color: #222222;
                line-height: 20px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                margin-top: 10px;
              }
            }
          }
        }
      }
    }

    .modal {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      z-index: 100;
    }

    .directory {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 340px;
      background: #ffffff;
      padding: 0 15px 30px;
      box-sizing: border-box;
      border-radius: 0px 10px 10px 0px;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-y: auto;
      z-index: 100;

      .directory-sticky {
        position: sticky;
        top: 0;
        width: 100%;
        background-color: #fff;

        .drawer-header {
          width: 100%;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .header-title {
            font-size: 16px;
            font-weight: 600;
            color: #222222;
          }

          .freelog {
            font-size: 12px;
            color: #333;
          }
        }

        .search-box {
          width: 100%;
          margin-bottom: 30px;

          .input-box {
            position: relative;
            width: 100%;
            height: 42px;
            display: flex;
            align-items: center;

            .search-input {
              height: 100%;
              width: 100%;
              font-size: 14px;
              color: #222;
              font-weight: bold;
              padding: 0 39px;
              box-sizing: border-box;
              transition: all 0.2s linear;
              border-radius: 42px;
              border: 1px solid #e4e4e4;

              &:hover,
              &:focus {
                border: 1px solid #2784ff;
              }

              &::-webkit-input-placeholder {
                color: #d1d1d1;
              }
            }

            .fl-icon-content {
              position: absolute;
              left: 15px;
              width: 14px;
              height: 14px;
              font-size: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #8e8e93;
            }
          }

          .search-tip {
            font-size: 14px;
            line-height: 20px;
            display: flex;
            justify-content: center;
            margin-top: 30px;

            .tip {
              color: #999999;
            }

            .clear-btn {
              color: #2784ff;
              margin-left: 15px;

              &:active {
                color: #2376e5;
              }
            }
          }
        }
      }

      .list-item {
        width: 100%;
        padding: 17px 15px;
        box-sizing: border-box;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        display: flex;
        align-items: center;

        &.active {
          background: rgba(39, 132, 255, 0.05);

          .item-title {
            color: #2784ff;
          }
        }

        & + .list-item {
          margin-top: 10px;
        }

        .item-title {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: #222222;
          line-height: 22px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .item-lock {
          width: 16px;
          height: 16px;
          margin-left: 20px;
        }
      }
    }

    .back-top {
      position: fixed;
      right: 30px;
      bottom: 50px;

      .fixed-btn {
        width: 50px;
        height: 50px;
        border-radius: 50px;
        color: #fff;
        background: #2784ff;
        box-shadow: 0px 2px 10px 0px rgba(39, 132, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;

        .freelog {
          font-size: 18px;
        }
      }
    }
  }

  // PC
  .home-body {
    width: 100%;
    display: flex;

    .list-bar {
      position: sticky;
      top: 70px;
      height: calc(100vh - 70px);
      overflow-y: auto;
      background: #fafbfc;
      box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .search-box {
        width: 100%;
        padding: 30px;
        box-sizing: border-box;

        .input-box {
          position: relative;
          width: 100%;
          height: 38px;
          display: flex;
          align-items: center;

          .search-input {
            height: 100%;
            flex: 1;
            width: 0;
            font-size: 14px;
            color: #222;
            font-weight: bold;
            padding: 0 39px;
            box-sizing: border-box;
            transition: all 0.2s linear;
            border-radius: 38px;
            border: 1px solid #e4e4e4;

            &:hover,
            &:focus {
              border: 1px solid #2784ff;
            }

            &::-webkit-input-placeholder {
              color: #d1d1d1;
            }
          }

          .fl-icon-content {
            position: absolute;
            left: 15px;
            width: 14px;
            height: 14px;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8e8e93;
          }
        }

        .search-tip {
          font-size: 14px;
          line-height: 20px;
          display: flex;
          justify-content: center;
          margin-top: 30px;

          .tip {
            color: #999999;
          }

          .clear-btn {
            color: #2784ff;
            margin-left: 15px;
            cursor: pointer;
            transition: all 0.2s linear;

            &:hover {
              color: #529dff;
            }

            &:active {
              color: #2376e5;
            }
          }
        }
      }

      .list-item {
        width: 100%;
        padding: 15px 30px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.2s linear;

        &:hover,
        &.active {
          background: rgba(0, 0, 0, 0.03);

          .item-title {
            color: #222222;
          }
        }

        .item-title {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: #999999;
          line-height: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          transition: all 0.2s linear;
        }

        .item-lock {
          width: 16px;
          height: 16px;
          margin-left: 30px;
          transition: all 0.1s linear;

          &:hover {
            transform: scale(1.2);
          }
        }
      }
    }

    .content-area {
      height: 100%;
      display: flex;
      justify-content: center;

      .content-body {
        position: relative;
        width: 750px;
        min-height: calc(100vh - 70px);
        padding-bottom: 285px;
        box-sizing: border-box;

        .markdown-wrapper {
          margin-top: 30px;
        }

        .lock-box {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .lock {
            width: 64px;
            height: 64px;
            font-size: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #b2b2b2;
          }

          .lock-tip {
            font-size: 20px;
            color: #222;
            line-height: 28px;
            margin-top: 40px;
          }

          .get-btn {
            padding: 9px 20px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 20px;
            font-weight: bold;
            background-color: #2784ff;
            color: #fff;
            margin-top: 40px;
            cursor: pointer;

            &:hover {
              background-color: #529dff;
            }

            &:active {
              background-color: #2376e5;
            }
          }
        }

        .footer-area {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 109px;

          .footer-bar {
            display: flex;
            align-items: center;
            font-size: 12px;
            line-height: 18px;
            color: #999;

            .divider {
              width: 1px;
              height: 14px;
              background: rgba(0, 0, 0, 0.15);
              margin: 0 15px;
            }
          }

          .switch-btns {
            width: 100%;
            display: flex;
            margin-top: 40px;

            .switch-btn {
              flex: 1;
              height: 78px;
              background: #fafbfc;
              border-radius: 4px;
              border: 1px solid #e4e4e4;
              display: flex;
              align-items: center;
              padding: 15px 20px;
              box-sizing: border-box;
              cursor: pointer;
              transition: all 0.2s linear;

              & + .switch-btn {
                margin-left: 10px;
              }

              &:hover {
                border: 1px solid #2784ff;

                .freelog {
                  font-size: 16px;
                  color: #2784ff;
                }
              }

              &.invalid {
                pointer-events: none;
                opacity: 0.4;
              }

              &.pre {
                .freelog {
                  transform: rotate(90deg);
                }

                .btn-info {
                  margin-left: 40px;
                  align-items: flex-end;
                }
              }

              &.next {
                .btn-info {
                  margin-right: 40px;
                }

                .freelog {
                  transform: rotate(-90deg);
                }
              }

              .freelog {
                font-size: 16px;
                color: #999;
                transition: all 0.2s linear;
              }

              .btn-info {
                flex: 1;
                width: 0;
                display: flex;
                flex-direction: column;

                .btn-title {
                  font-size: 12px;
                  font-weight: 600;
                  color: #999999;
                  line-height: 18px;
                }

                .document-title {
                  max-width: 100%;
                  font-size: 14px;
                  font-weight: 600;
                  color: #222222;
                  line-height: 20px;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  margin-top: 10px;
                }
              }
            }
          }
        }
      }
    }

    .title-directory {
      position: sticky;
      top: 100px;
      height: fit-content;
      margin-top: 30px;
      border-left: 1px solid rgba(0, 0, 0, 0.1);

      .directory-item {
        width: 100%;
        padding-left: 30px;
        box-sizing: border-box;
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
        transition: all 0.2s linear;

        &.second {
          padding-left: 50px;
        }

        &.third {
          padding-left: 70px;
        }

        &:hover,
        &.active {
          color: #2784ff;
        }

        & + .directory-item {
          margin-top: 15px;
        }
      }
    }

    .fixed-btns {
      position: fixed;
      right: 30px;
      bottom: 30px;

      .fixed-btn {
        position: relative;
        min-width: 48px;
        height: 48px;
        border-radius: 48px;
        color: #222;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s linear;

        &:hover {
          box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
        }

        .freelog {
          width: 48px;
          height: 48px;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .back-top {
        margin-top: 15px;
      }
    }

    @media (min-width: 0) {
      .list-bar {
        width: 280px;
        flex-shrink: 0;
      }

      .content-area {
        flex: 1;
        min-width: 860px;
      }

      .title-directory {
        display: none;
      }
    }

    @media (min-width: 1320px) {
      .content-area {
        width: 860px;
      }

      .title-directory {
        flex: 1;
        width: 0;
        display: block;

        .directory-item {
          padding-right: 30px;
        }
      }
    }

    @media (min-width: 1420px) {
      .list-bar {
        flex: 1;

        &.large {
          flex: none;
          width: calc(14 / 71 * 100%);
        }
      }

      .content-area.large {
        width: calc(57 / 71 * 100%);
      }

      .title-directory .directory-item {
        width: 250px !important;
        padding-right: 0;
      }
    }

    @media (min-width: 1512px) {
      .list-bar {
        .search-box,
        .list-item {
          width: 280px !important;
        }
      }
    }
  }
}
</style>
