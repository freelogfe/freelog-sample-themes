<!-- 页面头部 -->

<template>
  <!-- 移动端头部 -->
  <div
    id="headerWrapper"
    class="mobile-header-wrapper"
    :class="{ 'in-home': homeHeader }"
    v-if="inMobile && !mobileSearching"
  >
    <!-- 顶部 -->
    <div class="header-top" :class="{ logon: userData?.isLogin }">
      <img
        class="logo"
        :src="
          selfConfig.options_logoImage ||
          selfConfig.logoImage ||
          require('../assets/images/logo.png')
        "
        referrerpolicy="no-referrer"
        @click="switchPage('/home')"
        v-if="homeHeader"
      />
      <div
        class="header-top-left"
        @click="locationHistory.length === 1 ? switchPage('/home') : routerBack()"
        v-else
      >
        <img class="back-arrow" src="../assets/images/arrow.png" />
        <div class="back-label">
          {{ locationHistory.length === 1 ? "首页" : "返回" }}
        </div>
      </div>

      <div class="header-top-right">
        <i
          class="freelog fl-icon-content"
          @click="searchPopupShow = true"
          v-if="!homeHeader && !readerHeader"
        ></i>

        <img class="menu" src="../assets/images/menu.png" @click="userBoxShow = true" />
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-box" @click="searchPopupShow = true" v-if="homeHeader">
      <i class="freelog fl-icon-content"></i>
    </div>

    <!-- 用户弹窗 -->
    <transition name="fade">
      <div id="modal" class="modal" @click="userBoxShow = false" v-if="userBoxShow"></div>
    </transition>
    <transition name="slide-right">
      <div class="user-box-body" v-if="userBoxShow">
        <div class="user-box-top">
          <img
            class="avatar"
            :src="userData?.headImage || require('../assets/images/default-avatar.png')"
            :alt="userData?.username || '未登录'"
            @click="!userData?.isLogin && callLogin()"
          />
          <div class="username" @click="!userData?.isLogin && callLogin()">
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
              :class="{ active: route.path === '/shelf' }"
              @click="
                switchPage('/shelf');
                userBoxShow = false;
              "
              v-if="userData?.isLogin"
            >
              <i class="freelog fl-icon-shujia"></i>
              <div class="btn-label">我的收藏</div>
            </div>
            <div
              class="btn"
              :class="{ active: route.path === '/signedList' }"
              @click="
                switchPage('/signedList');
                userBoxShow = false;
              "
              v-if="userData?.isLogin"
            >
              <i class="freelog fl-icon-lishi"></i>
              <div class="btn-label">已签约漫画</div>
            </div>
          </div>

          <div class="footer-btn" @click="callLoginOut()" v-if="userData?.isLogin">
            <i class="freelog fl-icon-tuichu1"></i>
            <div class="btn-label">退出登录</div>
          </div>
          <div class="footer-btn" v-if="!userData?.isLogin">
            <div class="main-btn mobile" @click="callLogin()">立即登录</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 搜索页 -->
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
    <div class="header-box">
      <div class="header-left">
        <!-- logo -->
        <img
          class="logo"
          :src="
            selfConfig.options_logoImage ||
            selfConfig.logoImage ||
            require('../assets/images/logo.png')
          "
          @click="switchPage('/home')"
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
                  <i
                    class="freelog fl-icon-guanbi delete-btn"
                    @click.stop="deleteSearchHistory(item)"
                  ></i>
                </div>
              </div>

              <div class="text-btn" @click="clearHistory()">清空搜索记录</div>
            </div>
          </transition>
        </div>
      </div>

      <div class="header-right">
        <div class="nav-btn" @click="switchPage('/')">首页</div>
        <div class="nav-btn" @click="switchPage('/shelf')" v-if="userData?.isLogin">我的收藏</div>

        <div
          class="user-avatar"
          @mouseover="userBoxShow = true"
          @mouseleave="userBoxShow = false"
          v-if="userData?.isLogin"
        >
          <img class="avatar" :src="userData?.headImage" :alt="userData?.username" />

          <transition name="slide-down-scale">
            <div class="user-box" v-if="userBoxShow">
              <div class="user-box-body">
                <img class="avatar" :src="userData?.headImage" :alt="userData?.username" />
                <div class="username">{{ userData?.username }}</div>
                <div
                  class="btn user-box-btn"
                  @click="
                    switchPage('/signedList');
                    userBoxShow = false;
                  "
                >
                  已签约漫画
                </div>
                <div class="btn user-box-btn" @click="callLoginOut()">登出</div>
              </div>
            </div>
          </transition>
        </div>

        <div class="user-btns" v-else>
          <div class="btn header-login-btn" @click="callLogin()">登录</div>
          <div class="btn header-register-btn" @click="register()">注册</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, reactive, ref, toRefs, watch } from "vue";
import { useStore } from "vuex";
import { callLogin, callLoginOut } from "@/api/freelog";
import { useMyLocationHistory, useMyRouter, useSearchHistory } from "@/utils/hooks";
import { State } from "@/store/index";
import { freelogApp } from "freelog-runtime";

export default {
  name: "my-header",

  props: {
    homeHeader: {
      type: Boolean,
      default: false
    },
    readerHeader: {
      type: Boolean,
      default: false
    },
    mobileSearching: {
      type: Boolean,
      default: false
    }
  },

  setup(props: { homeHeader: boolean }) {
    const store = useStore<State>();
    const { query, route, switchPage, routerBack } = useMyRouter();
    const { searchHistory, searchWord, deleteWord, clearHistory } = useSearchHistory();
    const searchInput = ref();
    const searchHistoryPopup = ref();
    const mySearchHistory = computed(() =>
      searchHistory.value.filter(item => item.includes(data.searchKey))
    );

    const data = reactive({
      searchKey: "",
      userBoxShow: false,
      searchPopupShow: false,
      searchHistoryShow: false,
      searchWordCatch: null as number | null
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
        data.searchHistoryShow = false;
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

      /** 搜索框键盘快捷键 */
      inputKeyUp(e: KeyboardEvent) {
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
        const url = freelogApp.getCurrentUrl();
        const mainUrl = url.split("?")[0]
        const reg = /\.([^.]*)\.com/
        const domain = reg.exec(mainUrl)
        const domainName = domain ? domain[1] : "freelog"
        window.open(`https://user.${domainName}.com/logon`);
      }
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
      cur => {
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
      ...methods
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/header";
</style>
