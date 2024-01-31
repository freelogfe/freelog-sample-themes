<!-- 首页（阅读页） -->

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
                switchPage('/reader', {
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
                switchPage('/reader', {
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
                      :maxLength="100"
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
                  <div class="text-btn mobile" @click="switchPage('/reader')">返回列表</div>
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

      <div class="fixed-btns">
        <div class="fixed-btn" @click="share()">
          <i class="freelog fl-icon-fenxiang"></i>
        </div>
        <input id="href" class="hidden-input" :value="href" readOnly />

        <back-top class="back-top-box">
          <div class="fixed-btn">
            <i class="freelog fl-icon-huidaodingbu"></i>
          </div>
        </back-top>
      </div>
    </div>

    <!-- PC -->
    <div class="home-body" @click="setWidgetData('show', false)" v-if="!inMobile">
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
                  :maxLength="100"
                  placeholder="输入文档名称或关键字"
                  @input="searchKeyInput()"
                  @keyup="inputKeyUp($event)"
                  @focus="searchHistoryShow = true"
                />
                <i class="freelog fl-icon-content"></i>
                <i
                  class="freelog fl-icon-guanbi text-btn clear-btn"
                  @click="
                    searchKey = '';
                    search();
                  "
                  v-show="searchKey"
                ></i>

                <transition name="fade">
                  <div
                    ref="searchHistoryPopup"
                    class="search-history"
                    v-if="searchHistoryShow && mySearchHistory.length !== 0"
                  >
                    <div class="history-list">
                      <div
                        class="history-item"
                        :class="{ catch: searchWordCatch === index }"
                        v-for="(item, index) in mySearchHistory"
                        :key="item"
                        @click="clickSearchHistory(item)"
                        @mousemove="searchWordCatch = index"
                        @mouseleave="searchWordCatch = null"
                      >
                        <div class="item-word">{{ item }}</div>
                        <i class="freelog fl-icon-guanbi delete-btn" @click.stop="deleteSearchHistory(item)"></i>
                      </div>
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

              <div class="text-btn" @click="switchPage('/reader')">返回列表</div>
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
                  switchPage('/reader', {
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
                  switchPage('/reader', {
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
        <div class="fixed-btn" @click.stop="setWidgetData('show', true)">
          <div id="share" class="share-wrapper" />
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
import { computed, defineAsyncComponent, onBeforeUnmount, reactive, ref, toRefs, watch } from "vue";
import { useStore } from "vuex";
import { useGetList, useMyRouter, useMyScroll, useSearchHistory } from "../utils/hooks";
import {
  addAuth,
  getExhibitFileStream,
  getExhibitSignCount,
  getExhibitInfo,
  getExhibitAuthStatus,
  mountWidget,
  getSubDep,
  getCurrentUrl,
  pushMessage4Task,
} from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { relativeTime } from "@/utils/common";
import { showToast } from "@/utils/common";

export default {
  name: "reader",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-markdown": defineAsyncComponent(() => import("../components/markdown.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
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
    const searchHistoryPopup = ref();
    const mySearchHistory = computed(() => searchHistory.value.filter((item) => item.includes(data.searchKey)));

    const data = reactive({
      myLoading: null as boolean | null,
      currentId: "",
      documentData: null as ExhibitItem | null,
      directoryList: [] as HTMLElement[],
      currentTitle: "",
      searchKey: "",
      searching: false,
      searchPopupShow: false,
      searchHistoryShow: false,
      searchWordCatch: null as number | null,
      directoryShow: false,
      viewOffline: false, // 查看已下架展品
      href: "",
      shareWidget: null as any,
    });

    const currentIndex = computed(() => {
      return datasOfGetList.listData.value.findIndex((item) => item.exhibitId === data.currentId);
    });

    const methods = {
      /** 移动端分享 */
      share() {
        const input: any = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: data.documentData?.exhibitId } });
        pushMessage4Task({ taskConfigCode: "TS000804", meta: { presentableId: data.documentData?.exhibitId } });
      },

      /** 输入搜索词 */
      searchKeyInput(inHomeSearch = false) {
        data.searchKey = (data.searchKey || "").trim();
        data.searchHistoryShow = true;
        data.searchWordCatch = null;
        if (inHomeSearch) {
          !data.searchKey && switchPage("/reader");
          data.searchPopupShow = !data.searchKey;
        }
      },

      /** 点击历史搜索词 */
      clickSearchHistory(item: string) {
        data.searchKey = item;
        searchWord(data.searchKey);
        this.search();
        data.searchHistoryShow = false;
      },

      /** 删除历史搜索词 */
      deleteSearchHistory(item: string) {
        deleteWord(item);
      },

      /** 搜索框快捷键 */
      inputKeyUp(e: { keyCode: any }) {
        switch (e.keyCode) {
          case 13:
            // 回车
            if (data.searchWordCatch !== null) {
              data.searchKey = mySearchHistory.value[data.searchWordCatch];
            }
            data.searchWordCatch = null;
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

      /** 获取授权 */
      async getAuth(item: ExhibitItem) {
        const authResult = await addAuth(item.exhibitId);
        const { status } = authResult;
        if (status === 0) {
          item.defaulterIdentityType = 0;
          if (data.currentId === item.exhibitId) getDocumentData();
        }
      },

      /** 获取目录数据 */
      getDirectory(directoryList: HTMLElement[]) {
        data.directoryList = directoryList;
        if (data.currentTitle) methods.jumpToTitle(data.currentTitle);
      },

      /** 跳到标题位置 */
      jumpToTitle(title: string) {
        const el: any = data.directoryList.find((item) => item.innerText === title);
        if (!el) return;

        scrollTo(el.offsetTop);
      },

      /** 搜索 */
      search() {
        const { searchKey } = data;
        const query: { keywords?: string } = {};
        if (searchKey) query.keywords = searchKey;
        datasOfGetList.getList(query, true);
        data.searchHistoryShow = false;
      },

      /** 清除搜索 */
      clearSearch() {
        data.searchKey = "";
        this.search();
      },

      /** 点击文档 */
      clickDocument(item: ExhibitItem) {
        const { exhibitId, defaulterIdentityType } = item;

        if (![0, 4].includes(defaulterIdentityType)) {
          showToast("授权链异常，无法查看");
          return;
        }

        switchPage("/reader", { id: exhibitId });
      },

      /** 通知插件更新数据 */
      setWidgetData(key: string, value: any) {
        if (data.shareWidget && data.shareWidget.getApi().setData) {
          data.shareWidget.getApi().setData(key, value);
        }
      },
    };

    /** 获取列表数据 */
    const getData = () => {
      data.viewOffline = false;
      data.documentData = null;
      datasOfGetList.clearData();
      datasOfGetList.getList({}, true);
    };

    /** 获取文档数据 */
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
      data.href = getCurrentUrl();
      mountShareWidget();
      scrollToTop("auto");
      data.directoryList = [];

      if (documentData.defaulterIdentityType !== 0) {
        if (documentData.defaulterIdentityType === 4) {
          // 标的物未签约，自动弹出授权弹窗
          methods.getAuth(documentData);
        }
        endMyLoading();
        return;
      }

      const info: any = await getExhibitFileStream(exhibitId);
      if (!info) {
        endMyLoading();
        return;
      }

      (data.documentData as ExhibitItem).content = info.data;
      endMyLoading();
    };

    /** 快捷键 */
    const keyup = (e: KeyboardEvent) => {
      if (currentIndex.value === -1) return;

      if (e.key === "ArrowLeft" && currentIndex.value !== 0)
        switchPage("/reader", {
          id: datasOfGetList.listData.value[currentIndex.value - 1].exhibitId,
        });
      if (e.key === "ArrowRight" && currentIndex.value !== datasOfGetList.listData.value.length - 1)
        switchPage("/reader", {
          id: datasOfGetList.listData.value[currentIndex.value + 1].exhibitId,
        });
    };

    /** 结束骨架屏 */
    const endMyLoading = () => {
      setTimeout(() => {
        data.myLoading = false;
      }, 1000);
    };

    /** 根据点击区域判断历史搜索框是否关闭 */
    const ifCloseHistoryPopup = (e: MouseEvent) => {
      if (!searchInput.value || !searchHistoryPopup.value) return;
      const clickInput = searchInput.value.contains(e.target);
      const clickPopup = searchHistoryPopup.value.contains(e.target);
      if (!clickInput && !clickPopup) {
        data.searchHistoryShow = false;
      } else {
        searchInput.value.focus();
      }
    };

    /** 加载分享插件 */
    const mountShareWidget = async () => {
      if (store.state.inMobile) return;

      if (data.shareWidget) await data.shareWidget.unmount();
      const themeData = await getSubDep();
      const widget = themeData.subDep.find((item: any) => item.name === "ZhuC/Freelog插件-展品分享");
      if (!widget) return;
      data.shareWidget = await mountWidget({
        widget,
        container: document.getElementById("share"),
        topExhibitData: themeData,
        config: { exhibit: data.documentData, type: "文档" },
      });
    };

    watch(
      () => data.searchHistoryShow,
      (cur) => {
        if (cur) {
          document.addEventListener("click", ifCloseHistoryPopup);
        } else {
          document.removeEventListener("click", ifCloseHistoryPopup);
        }
      }
    );

    watch(
      () => datasOfGetList.listData.value,
      (cur) => {
        data.searching = !!data.searchKey;
        if (!cur.length && !data.searching) {
          data.currentId = "";
          return;
        }

        if (!query.value.id) {
          switchPage("/reader", { id: cur[0].exhibitId });
        } else if (data.currentId !== query.value.id) {
          data.currentId = query.value.id;
          getDocumentData();
        }
      }
    );

    watch(
      () => query.value,
      (cur) => {
        if (route.path !== "/reader") return;

        const { total } = datasOfGetList;
        if ((!total.value && !data.searching) || !cur.id) {
          getData();
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
        methods.setWidgetData("show", false);

        for (let i = data.directoryList.length - 1; i >= 0; i--) {
          if (cur >= data.directoryList[i].offsetTop) {
            const currentTitle = data.directoryList[i].innerText;
            data.currentTitle = currentTitle;
            switchPage("/reader", { id: data.currentId, title: currentTitle });
            break;
          }
        }
      }
    );

    onBeforeUnmount(async () => {
      window.removeEventListener("keyup", keyup);
      await data.shareWidget?.unmount();
    });

    window.addEventListener("keyup", keyup);

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
      searchHistoryPopup,
      ...toRefs(data),
      currentIndex,
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/reader";
</style>
