<!-- 页面头部 -->

<template>
  <!-- 移动端头部 -->
  <div class="mobile-header-wrapper" :class="{ 'in-home': homeHeader }" v-if="inMobile && !mobileSearching">
    <!-- header顶部 -->
    <div class="header-top" :class="{ logon: userData.isLogin }">
      <img
        class="logo"
        :src="selfConfig.logoImage || require('../assets/images/logo.png')"
        @click="switchPage('/')"
        v-if="homeHeader"
      />
      <div class="header-top-left" @click="locationHistory.length === 1 ? switchPage('/home') : routerBack()" v-else>
        <img class="back-arrow" src="../assets/images/arrow.png" />
        <div class="back-label">{{ locationHistory.length === 1 ? "首页" : "返回" }}</div>
      </div>

      <div class="header-top-right">
        <i class="freelog fl-icon-content" @click="searchPopupShow = true" v-if="!readerHeader"></i>

        <img class="menu" src="../assets/images/menu.png" @click="userBoxShow = true" />
      </div>
    </div>

    <!-- 节点信息 -->
    <template v-if="homeHeader">
      <div class="header-other-info">
        <div class="node-avatar">
          <img :src="nodeLogo || require('../assets/images/default-avatar.png')" alt="节点头像" class="avatar-img" />
        </div>
        <!-- <div class="sign-count">总签约量：{{ signCount }}人</div> -->
      </div>

      <div class="header-node-info" @click="nodeInfoPopupShow = true">
        <div class="node-title">{{ nodeTitle }}</div>
        <div class="node-desc" v-html="nodeShortDescription"></div>
      </div>
    </template>

    <transition name="fade">
      <div id="modal" class="modal" @click="userBoxShow = false" @touchmove.prevent v-if="userBoxShow"></div>
    </transition>

    <transition name="slide-right">
      <div class="user-box-body" v-if="userBoxShow">
        <div class="user-box-top">
          <img
            class="avatar"
            :src="userData?.headImage || require('../assets/images/default-avatar.png')"
            :alt="userData?.username || '未登录'"
            @click="!userData.isLogin && callLogin()"
          />
          <div class="username" @click="!userData.isLogin && callLogin()">
            {{ userData?.username || "未登录" }}
          </div>
          <div class="close-btn" @click="userBoxShow = false">
            <i class="freelog fl-icon-guanbi"></i>
          </div>
        </div>
        <div class="btns">
          <div class="menu-btns">
            <div
              class="btn"
              :class="{ active: route.path === '/home' }"
              @click="route.path !== '/home' && switchPage('/home')"
            >
              <i class="freelog fl-icon-shouye"></i>
              <div class="btn-label">首页</div>
            </div>
            <div
              class="btn"
              :class="{ active: route.path === '/signedList' }"
              @click="
                switchPage('/signedList');
                userBoxShow = false;
              "
              v-if="userData.isLogin"
            >
              <i class="freelog fl-icon-lishi"></i>
              <div class="btn-label">已签约图片/视频</div>
            </div>
          </div>

          <div class="footer-btn" @click="callLoginOut()" v-if="userData.isLogin">
            <i class="freelog fl-icon-tuichu1"></i>
            <div class="btn-label">退出登录</div>
          </div>
          <div class="footer-btn" v-if="!userData.isLogin">
            <div class="main-btn mobile" @click="callLogin()">立即登录</div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div class="search-page" v-if="searchPopupShow">
        <div class="search-page-header">
          <div class="search-page-box">
            <input
              class="search-input input-none"
              :class="{ 'in-focus': searchKey }"
              v-model="searchKey"
              :autofocus="true"
              @input="searchKeyInput()"
              @keyup.enter="
                searchWord(searchKey);
                search();
              "
              @keyup.esc="searchKey = ''"
            />
            <i class="freelog fl-icon-content"></i>
          </div>

          <div class="cancel-btn" @click="searchPopupShow = false">取消</div>
        </div>

        <div class="search-history-box" v-if="searchHistory.length !== 0">
          <div class="search-history-box-title">
            <div class="title">搜索记录</div>
            <div class="text-btn" @click="clearHistory()">清空</div>
          </div>
          <div class="search-history-box-list">
            <div class="tag" v-for="item in searchHistory" :key="item" @click="selectTag(item)">
              {{ item }}
              <i class="freelog fl-icon-guanbi" @click.stop="deleteWord(item)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div class="node-info-popup" @click="nodeInfoPopupShow = false" v-if="nodeInfoPopupShow">
        <div class="node-title">{{ nodeTitle }}</div>
        <div class="node-desc" v-html="nodeShortDescription"></div>
      </div>
    </transition>
  </div>

  <!-- 移动端首页搜索头部 -->
  <div class="mobile-search-header-wrapper" v-if="inMobile && mobileSearching">
    <div class="search-page-box">
      <input
        class="search-input input-none"
        :class="{ 'in-focus': searchKey }"
        v-model="searchKey"
        :maxLength="100"
        @input="searchKeyInput(true)"
        @keyup.enter="
          searchWord(searchKey);
          search();
        "
      />
      <i class="freelog fl-icon-content"></i>
    </div>

    <div class="cancel-btn" @click="switchPage('/home')">取消</div>
  </div>

  <!-- PC -->
  <div class="header-wrapper" v-if="!inMobile">
    <div class="header-top">
      <div class="header-top-left">
        <!-- logo -->
        <img
          class="logo"
          :src="selfConfig.logoImage || require('../assets/images/logo.png')"
          @click="switchPage('/')"
        />

        <!-- 搜索框 -->
        <div class="search-box">
          <input
            ref="searchInput"
            class="search-input input-none"
            :class="{ 'in-focus': searchKey }"
            v-model="searchKey"
            :maxLength="100"
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
      </div>

      <div class="header-top-right">
        <div class="nav-btn" @click="switchPage('/')">首页</div>
        <!-- 已登录用户信息 -->
        <div
          class="user-avatar"
          @mouseover="userBoxShow = true"
          @mouseleave="userBoxShow = false"
          v-if="userData.isLogin"
        >
          <img class="avatar" :src="userData.headImage" :alt="userData.username" />

          <transition name="slide-down-scale">
            <div class="user-box" v-show="userBoxShow">
              <div class="user-box-body">
                <img class="avatar" :src="userData.headImage" :alt="userData.username" />
                <div class="username">{{ userData.username }}</div>
                <div
                  class="user-box-btn"
                  @click="
                    switchPage('/signedList');
                    userBoxShow = false;
                  "
                >
                  已签约图片/视频
                </div>
                <div class="user-box-btn" @click="callLoginOut()">登出</div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 登录相关按钮 -->
        <div class="user-btns" v-else>
          <div class="btn header-login-btn" @click="callLogin()">登录</div>
          <div class="btn header-register-btn" @click="register()">注册</div>
        </div>
      </div>
    </div>

    <template v-if="homeHeader">
      <!-- 节点信息 -->
      <div class="header-node-info">
        <div class="node-avatar">
          <img :src="nodeLogo || require('../assets/images/default-avatar.png')" alt="节点头像" class="avatar-img" />
        </div>

        <div class="info-content">
          <div class="title-signcount">
            <div class="node-title" :title="nodeTitle">{{ nodeTitle }}</div>
            <!-- <div class="sign-count">总签约量：{{ signCount }}人</div> -->
          </div>
          <div class="node-desc" v-html="nodeShortDescription" :title="nodeShortDescription"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, reactive, ref, toRefs, watch } from "vue";
import { useMyLocationHistory, useMyRouter, useSearchHistory } from "../utils/hooks";
import { callLogin, callLoginOut, getNodeInfo } from "@/api/freelog";
import { useStore } from "vuex";

export default {
  name: "my-header",

  props: {
    homeHeader: {
      type: Boolean,
      default: false,
    },
    readerHeader: {
      type: Boolean,
      default: false,
    },
    mobileSearching: {
      type: Boolean,
      default: false,
    },
  },

  setup(props: { homeHeader: boolean }) {
    const nodeInfo = getNodeInfo();
    const store = useStore();
    const { query, route, switchPage, routerBack } = useMyRouter();
    const { searchHistory, searchWord, deleteWord, clearHistory } = useSearchHistory();
    const searchInput = ref();
    const searchHistoryPopup = ref();
    const mySearchHistory = computed(() => searchHistory.value.filter((item) => item.includes(data.searchKey)));

    const data = reactive({
      signCount: 0,
      searchKey: "",
      userBoxShow: false,
      nodeInfoPopupShow: false,
      searchPopupShow: false,
      searchHistoryShow: false,
      searchWordCatch: null as number | null,
    });

    const methods = {
      /** 输入搜索词 */
      searchKeyInput(inHomeSearch = false) {
        data.searchKey = (data.searchKey || "").trim();
        data.searchHistoryShow = true;
        data.searchWordCatch = null;
        if (inHomeSearch) {
          !data.searchKey && switchPage("/home");
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

      /** 搜索 */
      search() {
        data.searchPopupShow = false;
        const { searchKey } = data;
        const query: { keywords?: string } = {};
        if (searchKey) query.keywords = searchKey;
        switchPage("/home", query);
      },

      /** 搜索历史关键词 */
      selectTag(item: string) {
        data.searchPopupShow = false;
        data.searchKey = item;
        this.search();
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

      /** 注册 */
      register() {
        window.open("https://user.freelog.com/logon");
      },
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

    /** 初始化头部搜索相关数据 */
    const initHeaderSearch = () => {
      const { keywords } = query.value;
      data.searchKey = keywords || "";
    };

    watch(
      () => query.value,
      () => {
        initHeaderSearch();
      }
    );

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

    initHeaderSearch();
    useMyLocationHistory();

    return {
      ...props,
      ...nodeInfo,
      callLogin,
      callLoginOut,
      route,
      switchPage,
      routerBack,
      ...toRefs(store.state),
      searchInput,
      searchHistoryPopup,
      searchHistory,
      mySearchHistory,
      searchWord,
      deleteWord,
      clearHistory,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/header";
</style>
