<template>
  <div class="home-wrapper">
    <my-header @openDirectory="directoryShow = true" />

    <!-- mobile -->
    <div class="mobile-home-body" v-if="inMobile">
      <div class="no-data" v-if="loading === false && !total && myLoading === null">
        <img class="no-data-img" src="../assets/images/no-data.svg" />
      </div>
      <el-skeleton class="content-skeleton" :rows="9" animated v-if="myLoading === true" />
      <!-- 内容区域 -->
      <div class="content-area" v-if="myLoading === false">
        <my-markdown :data="documentData" v-if="documentData?.defaulterIdentityType === 0" />
        <template v-else-if="documentData?.defaulterIdentityType">
          <div class="auth-box" v-if="documentData?.defaulterIdentityType !== 4">
            <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
            <div class="auth-link-tip">授权链异常，无法查看</div>
          </div>
          <div class="lock-box" v-else-if="documentData?.defaulterIdentityType === 4 || userData.isLogin === false">
            <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth(documentData)">获取授权</div>
          </div>
        </template>

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
              :title="currentIndex ? listData[currentIndex - 1].exhibitTitle : ''"
              @click="
                switchPage('/home', {
                  id: listData[currentIndex - 1].exhibitId,
                })
              "
            >
              <i class="freelog fl-icon-fangxiang"></i>
              <div class="btn-info">
                <div class="btn-title">上一篇</div>
                <div class="document-title">
                  {{ currentIndex ? listData[currentIndex - 1].exhibitTitle : "当前为第一篇" }}
                </div>
              </div>
            </div>
            <div
              class="switch-btn next"
              :class="{ invalid: currentIndex === listData.length - 1 }"
              :title="currentIndex !== listData.length - 1 ? listData[currentIndex + 1].exhibitTitle : ''"
              @click="
                switchPage('/home', {
                  id: listData[currentIndex + 1].exhibitId,
                })
              "
            >
              <div class="btn-info">
                <div class="btn-title">下一篇</div>
                <div class="document-title">
                  {{
                    currentIndex !== listData.length - 1 ? listData[currentIndex + 1].exhibitTitle : "当前为最后一篇"
                  }}
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

            <el-skeleton class="list-skeleton" :rows="2" animated v-if="loading" />

            <div class="no-data-tip" v-if="!loading && !total && !searching">当前节点暂无内容</div>

            <template v-else-if="!loading">
              <template v-if="!viewOffline">
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
                  @click="
                    clickDocument(item);
                    directoryShow = false;
                  "
                >
                  <div class="item-title-box">
                    <div class="item-title" :style="{ opacity: [0, 4].includes(item.defaulterIdentityType) ? 1 : 0.4 }">
                      {{ item.exhibitTitle }}
                    </div>
                  </div>

                  <div class="other-box">
                    <img
                      class="auth-link-abnormal"
                      src="../assets/images/auth-link-abnormal.png"
                      v-if="![0, 4].includes(item.defaulterIdentityType)"
                    />
                    <img
                      class="item-lock"
                      src="../assets/images/mini-lock.png"
                      title="授权"
                      @click.stop="getAuth(item)"
                      v-if="item.defaulterIdentityType >= 4"
                    />
                  </div>
                </div>
              </template>

              <template v-if="viewOffline">
                <div class="offline-tip">
                  <div class="tip">当前文档已下架，已签约可继续浏览</div>
                  <div class="text-btn mobile" @click="switchPage('/home')">返回列表</div>
                </div>

                <div class="list-item active" @click="clickDocument(documentData)">
                  <div class="item-title-box">
                    <div
                      class="item-title"
                      :style="{ opacity: [0, 4].includes(documentData?.defaulterIdentityType) ? 1 : 0.4 }"
                    >
                      {{ documentData?.exhibitTitle }}
                    </div>
                    <div class="offline">已下架</div>
                  </div>

                  <div class="other-box">
                    <img
                      class="auth-link-abnormal"
                      src="../assets/images/auth-link-abnormal.png"
                      v-if="![0, 4].includes(documentData?.defaulterIdentityType)"
                    />

                    <img
                      class="item-lock"
                      src="../assets/images/mini-lock.png"
                      title="授权"
                      @click.stop="getAuth(documentData)"
                      v-if="documentData?.defaulterIdentityType >= 4"
                    />
                  </div>
                </div>
              </template>
            </template>
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
      <div class="list-bar">
        <el-skeleton class="list-skeleton" :rows="2" animated v-if="loading" />

        <div class="no-data-tip" v-if="!loading && !total && !searching">当前节点暂无内容</div>

        <template v-else-if="!loading">
          <template v-if="!viewOffline">
            <!-- 搜索框 -->
            <div class="search-box">
              <div class="input-box">
                <input
                  ref="searchInput"
                  class="search-input input-none"
                  :class="{ 'in-focus': searchKey }"
                  v-model="searchKey"
                  placeholder="输入文档名称或关键字"
                  @input="searchKeyInput()"
                  @keyup="inputKeyUp($event)"
                  @focus="searchHistoryShow = true"
                  @blur="searchHistoryShow = false"
                />
                <i class="freelog fl-icon-content"></i>
                <i
                  class="freelog fl-icon-guanbi text-btn"
                  @click="
                    searchKey = '';
                    search();
                  "
                  v-show="searchKey"
                ></i>

                <transition name="fade">
                  <div class="search-history" v-if="searchHistoryShow && mySearchHistory.length !== 0">
                    <div
                      class="history-item"
                      :class="{ catch: searchWordCatch === index }"
                      v-for="(item, index) in mySearchHistory"
                      :key="item"
                      @click="clickSearchHistory(item)"
                      @mousemove="searchWordCatch = index"
                    >
                      <div class="item-word">{{ item }}</div>
                      <i class="freelog fl-icon-guanbi" @click.stop="deleteSearchHistory(item)"></i>
                    </div>

                    <div class="text-btn" @click="clearHistory()">清空搜索记录</div>
                  </div>
                </transition>
              </div>

              <div class="search-tip" v-show="searching">
                <div class="tip">查询到{{ listData.length }}个相关结果</div>
                <div class="clear-btn" @click="clearSearch()">清空</div>
              </div>
            </div>

            <div class="list">
              <div
                class="list-item"
                :class="{ active: currentId === item.exhibitId }"
                v-for="item in listData"
                :key="item.exhibitId"
                @click="clickDocument(item)"
              >
                <div class="item-title-box">
                  <div
                    class="item-title"
                    :style="{ opacity: [0, 4].includes(item.defaulterIdentityType) ? 1 : 0.4 }"
                    :title="item?.exhibitTitle"
                  >
                    {{ item.exhibitTitle }}
                  </div>
                </div>
                <div class="other-box">
                  <img
                    class="auth-link-abnormal"
                    src="../assets/images/auth-link-abnormal.png"
                    v-if="![0, 4].includes(item.defaulterIdentityType)"
                  />
                  <img
                    class="item-lock"
                    src="../assets/images/mini-lock.png"
                    title="授权"
                    @click.stop="getAuth(item)"
                    v-if="item.defaulterIdentityType >= 4"
                  />
                </div>
              </div>
            </div>
          </template>

          <template v-if="viewOffline">
            <div class="offline-tip">
              <div class="tip">当前文档已下架，已签约可继续浏览</div>

              <div class="text-btn" @click="switchPage('/home')">返回列表</div>
            </div>

            <div class="list-item active" @click="clickDocument(documentData)">
              <div class="item-title-box">
                <div
                  class="item-title"
                  :style="{ opacity: [0, 4].includes(documentData?.defaulterIdentityType) ? 1 : 0.4 }"
                  :title="documentData?.exhibitTitle"
                >
                  {{ documentData?.exhibitTitle }}
                </div>
                <div class="offline">已下架</div>
              </div>

              <div class="other-box">
                <img
                  class="auth-link-abnormal"
                  src="../assets/images/auth-link-abnormal.png"
                  v-if="![0, 4].includes(documentData?.defaulterIdentityType)"
                />

                <img
                  class="item-lock"
                  src="../assets/images/mini-lock.png"
                  title="授权"
                  @click.stop="getAuth(documentData)"
                  v-if="documentData?.defaulterIdentityType >= 4"
                />
              </div>
            </div>
          </template>
        </template>
      </div>

      <div class="no-data" v-if="loading === false && !total && myLoading === null">
        <img class="no-data-img" src="../assets/images/no-data.svg" />
      </div>
      <el-skeleton class="content-skeleton" :rows="9" animated v-if="myLoading === true" />
      <!-- 内容区域 -->
      <div class="content-area" v-if="myLoading === false">
        <div class="content-body">
          <my-markdown
            :data="documentData"
            @getDirectory="getDirectory($event)"
            v-if="documentData?.defaulterIdentityType === 0"
          />
          <template v-else-if="documentData?.defaulterIdentityType">
            <div class="auth-box" v-if="documentData?.defaulterIdentityType !== 4">
              <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
              <div class="auth-link-tip">授权链异常，无法查看</div>
            </div>
            <div class="lock-box" v-else-if="documentData?.defaulterIdentityType === 4 || userData.isLogin === false">
              <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
              <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
              <div class="get-btn" @click="getAuth(documentData)">获取授权</div>
            </div>
          </template>

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
                :title="currentIndex ? listData[currentIndex - 1].exhibitTitle : ''"
                @click="
                  switchPage('/home', {
                    id: listData[currentIndex - 1].exhibitId,
                  })
                "
              >
                <i class="freelog fl-icon-fangxiang"></i>
                <div class="btn-info">
                  <div class="btn-title">上一篇</div>
                  <div class="document-title">
                    {{ currentIndex ? listData[currentIndex - 1].exhibitTitle : "当前为第一篇" }}
                  </div>
                </div>
              </div>
              <div
                class="switch-btn next"
                :class="{ invalid: currentIndex === listData.length - 1 }"
                :title="currentIndex !== listData.length - 1 ? listData[currentIndex + 1].exhibitTitle : ''"
                @click="
                  switchPage('/home', {
                    id: listData[currentIndex + 1].exhibitId,
                  })
                "
              >
                <div class="btn-info">
                  <div class="btn-title">下一篇</div>
                  <div class="document-title">
                    {{
                      currentIndex !== listData.length - 1 ? listData[currentIndex + 1].exhibitTitle : "当前为最后一篇"
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
      <div class="title-directory-box">
        <div class="title-directory-icon" v-if="directoryList.length">
          <div class="icon" v-for="item in 6" :key="`directoryIcon${item}`"></div>
        </div>
        <div class="title-directory">
          <div
            class="directory-item"
            :class="{
              active: currentTitle === item.innerText,
              second: item.nodeName === 'H2',
              third: item.nodeName === 'H3',
            }"
            :title="item.innerText"
            v-for="item in directoryList"
            :key="item.id"
            @click="jumpToTitle(item.innerText)"
          >
            <span>{{ item.innerText }}</span>
          </div>
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
import { computed, defineAsyncComponent, onUnmounted, reactive, ref, toRefs, watch } from "vue";
import { useStore } from "vuex";
import { useGetList, useMyRouter, useMyScroll, useSearchHistory } from "../utils/hooks";
import {
  addAuth,
  getExhibitFileStream,
  getExhibitSignCount,
  getExhibitInfo,
  getExhibitAuthStatus,
} from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { relativeTime } from "@/utils/common";
import { showToast } from "../../../comic-theme/src/utils/common";

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
    const { query, switchPage, route } = useMyRouter();
    const { searchHistory, searchWord, deleteWord, clearHistory } = useSearchHistory();
    const { scrollTop, scrollTo, scrollToTop } = useMyScroll();
    const datasOfGetList = useGetList();
    const searchInput = ref();
    const mySearchHistory = computed(() => searchHistory.value.filter((item) => item.includes(data.searchKey)));

    const data = reactive({
      myLoading: null as boolean | null,
      currentId: "",
      documentData: null as ExhibitItem | null,
      directoryList: [] as HTMLElement[],
      currentTitle: "",
      sharePopupShow: false,
      searchKey: "",
      searching: false,
      searchPopupShow: false,
      searchHistoryShow: false,
      searchWordCatch: null as number | null,
      directoryShow: false,
      viewOffline: false, // 查看已下架展品
    });

    const currentIndex = computed(() => {
      return datasOfGetList.listData.value.findIndex((item) => item.exhibitId === data.currentId);
    });

    const methods = {
      // 输入搜索词
      searchKeyInput(inHomeSearch = false) {
        data.searchKey = (data.searchKey || "").trim();
        data.searchHistoryShow = true;
        data.searchWordCatch = null;
        if (inHomeSearch) {
          !data.searchKey && switchPage("/home");
          data.searchPopupShow = !data.searchKey;
        }
      },

      // 点击历史搜索词
      clickSearchHistory(item: string) {
        data.searchKey = item;
        searchWord(data.searchKey);
        this.search();
        data.searchHistoryShow = false;
      },

      // 删除历史搜索词
      deleteSearchHistory(item: string) {
        searchInput.value.focus();
        deleteWord(item);
      },

      // 搜索历史关键词
      selectTag(item: string) {
        data.searchPopupShow = false;
        data.searchKey = item;
        this.search();
      },

      // 搜索框键盘事件
      inputKeyUp(e: { keyCode: any }) {
        switch (e.keyCode) {
          case 13:
            // 回车
            if (data.searchWordCatch !== null) {
              data.searchKey = mySearchHistory.value[data.searchWordCatch];
            }
            data.searchWordCatch = null;
            data.searchHistoryShow = false;
            searchWord(data.searchKey);
            this.search();
            break;
          case 27:
            // esc
            data.searchKey = "";
            data.searchWordCatch = null;
            data.searchHistoryShow = true;
            break;
          case 38:
            // 上
            if (data.searchWordCatch === null || data.searchWordCatch === 0) {
              data.searchWordCatch = null;
            } else {
              data.searchWordCatch = data.searchWordCatch - 1;
            }
            break;
          case 40:
            // 下
            data.searchHistoryShow = true;
            if (data.searchWordCatch === null) {
              data.searchWordCatch = 0;
            } else if (data.searchWordCatch !== mySearchHistory.value.length - 1) {
              data.searchWordCatch = data.searchWordCatch + 1;
            }
            break;
          default:
            break;
        }
      },

      // 授权
      async getAuth(item: ExhibitItem) {
        const authResult = await addAuth(item.exhibitId);
        const { status } = authResult;
        if (status === 0) {
          item.defaulterIdentityType = 0;
          if (data.currentId === item.exhibitId) getDocumentData();
        }
      },

      // 获取目录数据
      getDirectory(directoryList: HTMLElement[]) {
        data.directoryList = directoryList;
        if (data.currentTitle) methods.jumpToTitle(data.currentTitle);
      },

      // 跳到标题位置
      jumpToTitle(title: string) {
        const el: any = data.directoryList.find((item) => item.innerText === title);
        if (!el) return;

        scrollTo(el.offsetTop);
      },

      // 搜索
      search() {
        const { searchKey } = data;
        const query: { keywords?: string } = {};
        if (searchKey) query.keywords = searchKey;
        datasOfGetList.getList(query, true);
      },

      // 清除搜索
      clearSearch() {
        data.searchKey = "";
        this.search();
      },

      // 点击文档
      clickDocument(item: ExhibitItem) {
        const { exhibitId, defaulterIdentityType } = item;

        if (![0, 4].includes(defaulterIdentityType)) {
          showToast("授权链异常，无法查看");
          return;
        }

        switchPage("/home", { id: exhibitId });
      },
    };

    // 获取列表数据
    const getData = () => {
      data.viewOffline = false;
      data.documentData = null;
      datasOfGetList.clearData();
      datasOfGetList.getList({}, true);
    };

    // 获取文档数据
    const getDocumentData = async () => {
      data.myLoading = true;
      const exhibitId = data.currentId;
      let documentData: any = datasOfGetList.listData.value.find((item) => item.exhibitId === exhibitId);
      data.viewOffline = false;

      const requestArr = [getExhibitSignCount(exhibitId)];
      if (!documentData) {
        requestArr.push(getExhibitInfo(exhibitId, { isLoadVersionProperty: 1 }), getExhibitAuthStatus(exhibitId));
        const [signCountData, exhibitInfo, statusInfo] = await Promise.all(requestArr);
        documentData = {
          ...exhibitInfo.data.data,
          signCount: signCountData.data.data[0].count,
          defaulterIdentityType: statusInfo.data.data[0].defaulterIdentityType,
        };
        if (exhibitInfo.data.errCode === 0) data.viewOffline = true;
      } else {
        const [signCountData] = await Promise.all(requestArr);
        documentData.signCount = signCountData.data.data[0].count;
      }

      data.documentData = documentData;
      scrollToTop("auto");
      data.directoryList = [];

      if (documentData.defaulterIdentityType !== 0) {
        data.myLoading = false;
        return;
      }

      const info: any = await getExhibitFileStream(exhibitId);
      if (!info) {
        data.myLoading = false;
        return;
      }

      (data.documentData as ExhibitItem).content = info.data;
      data.myLoading = false;
    };

    const keyup = (e: KeyboardEvent) => {
      if (currentIndex.value === -1) return;

      if (e.key === "ArrowLeft" && currentIndex.value !== 0)
        switchPage("/home", {
          id: datasOfGetList.listData.value[currentIndex.value - 1].exhibitId,
        });
      if (e.key === "ArrowRight" && currentIndex.value !== datasOfGetList.listData.value.length - 1)
        switchPage("/home", {
          id: datasOfGetList.listData.value[currentIndex.value + 1].exhibitId,
        });
    };

    watch(
      () => datasOfGetList.listData.value,
      (cur) => {
        data.searching = !!data.searchKey;
        if (!cur.length && !data.searching) {
          data.currentId = "";
          return;
        }

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
        if (route.path !== "/home") return;

        const { total } = datasOfGetList;
        if (!total.value && !data.searching) {
          getData();
        } else if (!cur.id) {
          switchPage("/home", { id: datasOfGetList.listData.value[0].exhibitId });
        } else if (cur.id !== data.currentId) {
          data.currentId = query.value.id;
          getDocumentData();
        }
        if (cur.title !== data.currentTitle) data.currentTitle = cur.title || "";
      },
      { immediate: true }
    );

    watch(
      () => scrollTop.value,
      (cur) => {
        data.sharePopupShow = false;

        for (let i = data.directoryList.length - 1; i >= 0; i--) {
          if (cur >= data.directoryList[i].offsetTop) {
            const currentTitle = data.directoryList[i].innerText;
            data.currentTitle = currentTitle;
            switchPage("/home", { id: data.currentId, title: currentTitle });
            break;
          }
        }
      }
    );

    window.addEventListener("keyup", keyup);
    onUnmounted(() => {
      window.removeEventListener("keyup", keyup);
    });

    return {
      relativeTime,
      ...toRefs(store.state),
      ...datasOfGetList,
      switchPage,
      searchHistory,
      mySearchHistory,
      searchWord,
      deleteWord,
      clearHistory,
      searchInput,
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

    .no-data {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;

      .no-data-img {
        margin-top: 100px;
        width: 275px;
        height: 250px;
      }
    }

    .content-skeleton {
      width: 100%;
      padding: 30px;
      box-sizing: border-box;

      ::v-deep .el-skeleton__item {
        display: block;
        width: 100%;
        height: 30px;
        border-radius: 6px;
        background: linear-gradient(90deg, #f0f2f5 3%, #e6e8eb 37%, #f0f2f5 63%);
        background-size: 400% 100%;

        & + .el-skeleton__item {
          margin-top: 20px;
        }

        &:nth-child(1) {
          width: 240/780 * 100%;
        }

        &:nth-child(2) {
          width: 600/780 * 100%;
        }

        &:nth-child(3) {
          width: 120/780 * 100%;
        }

        &:nth-child(4) {
          margin-top: 50px;
        }

        &:nth-child(5) {
          width: 540/780 * 100%;
        }

        &:nth-child(6) {
          width: 300/780 * 100%;
        }

        &:nth-child(7) {
          width: 120/780 * 100%;
        }

        &:nth-child(8) {
          margin-top: 50px;
          width: 120/780 * 100%;
        }

        &:nth-child(9) {
          width: 300/780 * 100%;
        }

        &:nth-child(10) {
          width: 540/780 * 100%;
        }
      }
    }

    .content-area {
      position: relative;
      width: 100%;
      min-height: calc(100vh - 60px);
      padding: 0 15px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      flex-shrink: 0;

      .markdown-wrapper {
        margin-top: 30px;
        margin-bottom: 417px;
      }

      .auth-box {
        width: 100%;
        height: 454px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 377px;

        .auth-link-abnormal {
          width: 72px;
          height: 72px;
        }

        .auth-link-tip {
          font-size: 16px;
          color: #222222;
          line-height: 22px;
          margin-top: 30px;
        }
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

        .list-skeleton {
          width: 100%;
          margin-top: 30px;
          box-sizing: border-box;

          ::v-deep .el-skeleton__item {
            width: 100%;
            height: 30px;
            border-radius: 6px;
            background: linear-gradient(90deg, #f0f2f5 3%, #e6e8eb 37%, #f0f2f5 63%);
            background-size: 400% 100%;

            & + .el-skeleton__item {
              margin-top: 20px;
            }

            &:nth-child(2) {
              width: 75%;
            }

            &:nth-child(3) {
              width: 50%;
            }
          }
        }

        .no-data-tip {
          width: 100%;
          margin-top: 200px;
          text-align: center;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.4);
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

      .offline-tip {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;
        padding-bottom: 25px;

        .tip {
          font-size: 14px;
          font-weight: 400;
          color: #666666;
          line-height: 20px;
        }

        .text-btn {
          font-size: 14px;
          line-height: 20px;
          margin-top: 20px;
        }
      }

      .list-item {
        width: 100%;
        height: 56px;
        padding: 0 15px;
        box-sizing: border-box;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        display: flex;
        align-items: center;

        &.active {
          background: rgba(39, 132, 255, 0.05);

          .item-title {
            color: #2784ff !important;
          }
        }

        & + .list-item {
          margin-top: 10px;
        }

        .item-title-box {
          flex: 1;
          width: 0;
          display: flex;
          align-items: center;

          .item-title {
            max-width: 100%;
            font-size: 16px;
            font-weight: 600;
            color: #999;
            line-height: 22px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            transition: all 0.2s linear;
          }

          .offline {
            flex-shrink: 0;
            width: 40px;
            height: 20px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 5px;
          }
        }

        .other-box {
          display: flex;
          justify-content: flex-end;

          .auth-link-abnormal {
            width: 16px;
            height: 16px;
            margin-left: 20px;
          }

          .item-lock {
            width: 16px;
            height: 16px;
            margin-left: 20px;
          }

          .auth-link-abnormal + .item-lock {
            margin-left: 5px;
          }
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

      .list-skeleton {
        width: 100%;
        padding: 30px;
        box-sizing: border-box;

        ::v-deep .el-skeleton__item {
          width: 100%;
          height: 30px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0f2f5 3%, #e6e8eb 37%, #f0f2f5 63%);
          background-size: 400% 100%;

          & + .el-skeleton__item {
            margin-top: 20px;
          }

          &:nth-child(2) {
            width: 75%;
          }

          &:nth-child(3) {
            width: 50%;
          }
        }
      }

      .no-data-tip {
        width: 100%;
        margin-top: 292px;
        text-align: center;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.4);
      }

      .search-box {
        width: 100%;
        padding: 30px;
        box-sizing: border-box;

        .input-box {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;

          .search-input {
            flex: 1;
            width: 0;
            height: 38px;
            border-radius: 38px;
            font-size: 14px;
            color: #222;
            font-weight: bold;
            padding: 0 39px;
            box-sizing: border-box;
            transition: all 0.2s linear;
            border: 1px solid #e4e4e4;

            &:hover,
            &:focus,
            &.in-focus {
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

          .fl-icon-guanbi {
            position: absolute;
            right: 15px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 2px;
            cursor: pointer;
          }

          .search-history {
            position: absolute;
            left: 0;
            right: 0;
            top: 100%;
            margin-top: 5px;
            min-height: 170px;
            background-color: #fff;
            background: #ffffff;
            box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 4px;
            padding-bottom: 50px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 2;

            .history-item {
              width: 100%;
              height: 34px;
              border-radius: 4px;
              padding: 0 11px;
              box-sizing: border-box;
              display: flex;
              align-items: center;
              justify-content: space-between;
              cursor: pointer;
              transition: all 0.2s linear;

              &.catch,
              &:hover {
                background: rgba(0, 0, 0, 0.03);

                .freelog {
                  opacity: 1;
                }
              }

              .item-word {
                font-size: 12px;
                color: #222222;
              }

              .freelog {
                width: 10px;
                height: 10px;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #999;
                cursor: pointer;
                transition: all 0.2s linear;
                opacity: 0;

                &:hover {
                  color: #a9a9ad;
                }
              }
            }

            .text-btn {
              position: absolute;
              bottom: 12px;
              font-size: 12px;
              line-height: 18px;
            }
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

      .offline-tip {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 30px;
        padding-bottom: 20px;

        .tip {
          font-size: 12px;
          font-weight: 400;
          color: #666666;
          line-height: 17px;
        }

        .text-btn {
          font-size: 12px;
          line-height: 17px;
          margin-top: 15px;
          cursor: pointer;
        }
      }

      .list {
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;

        .list-item {
          width: 100%;
          height: 50px;
          padding: 15px 20px;
          box-sizing: border-box;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s linear;

          & + .list-item {
            margin-top: 5px;
          }

          &:hover {
            background: rgba(0, 0, 0, 0.03);
          }

          &.active {
            background: rgba(0, 0, 0, 0.03);

            .item-title {
              color: #222222 !important;
            }
          }

          .item-title-box {
            flex: 1;
            width: 0;
            display: flex;
            align-items: center;

            .item-title {
              max-width: 100%;
              font-size: 14px;
              font-weight: 600;
              color: #999;
              line-height: 20px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              transition: all 0.2s linear;
            }

            .offline {
              flex-shrink: 0;
              width: 40px;
              height: 20px;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 5px;
            }
          }

          .other-box {
            display: flex;
            justify-content: flex-end;

            .auth-link-abnormal {
              width: 16px;
              height: 16px;
              margin-left: 30px;
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

            .auth-link-abnormal + .item-lock {
              margin-left: 5px;
            }
          }
        }
      }
    }

    .no-data {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;

      .no-data-img {
        margin-top: 190px;
        width: 275px;
        height: 250px;
      }
    }

    .content-skeleton {
      width: 100%;
      padding: 30px 100px;
      box-sizing: border-box;

      ::v-deep .el-skeleton__item {
        display: block;
        width: 100%;
        height: 30px;
        border-radius: 6px;
        background: linear-gradient(90deg, #f0f2f5 3%, #e6e8eb 37%, #f0f2f5 63%);
        background-size: 400% 100%;

        & + .el-skeleton__item {
          margin-top: 20px;
        }

        &:nth-child(1) {
          width: 240/780 * 100%;
        }

        &:nth-child(2) {
          width: 600/780 * 100%;
        }

        &:nth-child(3) {
          width: 120/780 * 100%;
        }

        &:nth-child(4) {
          margin-top: 50px;
        }

        &:nth-child(5) {
          width: 540/780 * 100%;
        }

        &:nth-child(6) {
          width: 300/780 * 100%;
        }

        &:nth-child(7) {
          width: 120/780 * 100%;
        }

        &:nth-child(8) {
          margin-top: 50px;
          width: 120/780 * 100%;
        }

        &:nth-child(9) {
          width: 300/780 * 100%;
        }

        &:nth-child(10) {
          width: 540/780 * 100%;
        }
      }
    }

    .content-area {
      height: 100%;
      display: flex;
      justify-content: center;

      .content-body {
        position: relative;
        width: 780px;
        min-height: calc(100vh - 70px);
        padding-bottom: 285px;
        box-sizing: border-box;

        .markdown-wrapper {
          margin-top: 30px;
        }

        .auth-box {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .auth-link-abnormal {
            width: 72px;
            height: 72px;
          }

          .auth-link-tip {
            font-size: 16px;
            color: #222222;
            line-height: 22px;
            margin-top: 30px;
          }
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

    .title-directory-box {
      position: sticky;
      top: 70px;
      height: calc(100vh - 70px);
      padding-top: 30px;
      box-sizing: border-box;
      background-color: #fff;

      .title-directory-icon {
        position: absolute;
        left: -20px;
        top: 30px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .icon {
          width: 20px;
          height: 4px;
          background: rgba(0, 0, 0, 0.1);

          & + .icon {
            margin-top: 15px;
          }

          &:nth-child(3),
          &:nth-child(4) {
            width: 15px;
          }

          &:nth-child(5),
          &:nth-child(6) {
            width: 10px;
          }
        }
      }

      .title-directory {
        width: 100%;
        height: fit-content;
        max-height: 100%;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 0;
        }

        .directory-item {
          width: 100%;
          padding: 0 30px;
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
        width: 300px;
        flex-shrink: 0;
      }

      .content-area {
        flex: 1;
        min-width: calc(780px + 140px);
      }

      .title-directory-box {
        position: fixed;
        left: 100vw;
        width: 200px;
        transition: all 0.2s ease;

        &:hover {
          left: calc(100vw - 200px);
          box-shadow: -1px 0px 3px 0px rgba(0, 0, 0, 0.1);

          .title-directory-icon {
            opacity: 0;
          }
        }

        .title-directory {
          border-left: none;
        }
      }
    }

    @media (min-width: 1400px) {
      .content-area {
        min-width: 780px;
      }

      .title-directory-box {
        position: sticky;
        width: 300px;

        &:hover {
          left: none;
          box-shadow: none;
        }

        .title-directory {
          border-left: 1px solid rgba(0, 0, 0, 0.1);
        }

        .title-directory-icon {
          display: none;
        }
      }
    }

    @media (min-width: 1480px) {
      .list-bar {
        width: 0;
        flex: 2;

        .offline-tip,
        .search-box,
        .list {
          width: 300px !important;
        }
      }

      .content-area {
        flex: none;
        width: calc(780px + 200px);
      }

      .title-directory-box {
        width: 0;
        flex: 1;
      }
    }
  }
}
</style>
