<!-- 页面头部 -->

<template>
  <div class="header-wrapper">
    <!-- mobile -->
    <div
      class="mobile-header-wrapper"
      :class="{ home: currentPath === '/home', search: currentPath === '/search-list' }"
      v-if="$store.state.inMobile"
    >
      <!-- 非搜索页头部 -->
      <template v-if="currentPath !== '/search-list'">
        <div class="header-left" @click="back()">
          <template v-if="currentPath !== '/home'">
            <img class="back-arrow" src="../assets/images/arrow.png" />
            <div class="back-label">
              {{ $store.state.locationHistory.length === 1 ? "首页" : "返回" }}
            </div>
          </template>
        </div>

        <div class="header-right">
          <i class="freelog fl-icon-content" @click="toPage('/search-list')"></i>

          <img class="menu" src="../assets/images/menu.png" @click="userBoxShow = true" />
        </div>
      </template>

      <!-- 搜索页头部 -->
      <template v-if="currentPath === '/search-list'">
        <div class="search-box">
          <input
            ref="searchInput"
            class="search-input input-none"
            :class="{ 'in-focus': searchKey }"
            v-model="searchKey"
            :maxLength="100"
            @input="searchKeyInput()"
            @keyup.enter="search()"
            @keyup.esc="
              searchKey = '';
              searchHistoryShow = true;
            "
          />
          <i class="freelog fl-icon-content"></i>
          <i
            class="freelog fl-icon-guanbi"
            @click="
              searchKey = '';
              searchHistoryShow = true;
            "
            v-show="searchKey"
          ></i>
        </div>
        <div class="cancel-btn" @click="back()">取消</div>

        <transition name="fade">
          <div class="search-history" v-if="searchHistoryShow">
            <div class="search-history-title">
              <div class="title">搜索记录</div>
              <div class="clear-btn" @click="clearHistory()">清空</div>
            </div>
            <div class="search-history-list">
              <div class="tag" v-for="item in searchHistory" :key="item" @click="selectTag(item)">
                {{ item }}
                <i class="freelog fl-icon-guanbi" @click.stop="deleteWord(item)"></i>
              </div>
            </div>
          </div>
        </transition>
      </template>

      <!-- 用户弹窗 -->
      <transition name="fade">
        <div id="modal" class="modal" @click="userBoxShow = false" v-if="userBoxShow"></div>
      </transition>
      <transition name="slide-right">
        <div class="user-box-body" v-if="userBoxShow">
          <div class="user-box-top">
            <img
              class="avatar"
              :src="userData.headImage || require('../assets/images/default-user-avatar.png')"
              :alt="userData.username || '未登录'"
              @click="!userData.isLogin && callLogin()"
            />
            <div class="username" @click="!userData.isLogin && callLogin()">
              {{ userData.username || "未登录" }}
            </div>
            <i class="freelog fl-icon-guanbi close-btn" @click="userBoxShow = false"></i>
          </div>
          <div class="btns">
            <div class="menu-btns">
              <template v-for="item in menuBtnList">
                <div
                  class="btn"
                  :class="{ active: currentPath === item.path }"
                  @click="toPage(item.path)"
                  v-if="!item.hidden"
                >
                  <i class="freelog" :class="item.icon"></i>
                  <div class="btn-label">{{ item.label }}</div>
                </div>
              </template>
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
    </div>

    <!-- PC -->
    <div class="pc-header-wrapper" v-if="$store.state.inMobile === false">
      <div class="header-left">
        <div
          class="btn"
          :class="{ active: currentPath === item.value }"
          v-for="item in tabList"
          :key="item.value"
          @click="toPage(item.value)"
          v-if="item.value !== '/collection-list' || userData.isLogin"
        >
          {{ item.label }}
        </div>
      </div>

      <div class="header-right">
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
          <i class="freelog fl-icon-guanbi text-btn clear-btn" @click="searchKey = ''" v-show="searchKey"></i>

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

        <el-popover
          popper-class="header-user-box"
          placement="bottom-end"
          trigger="hover"
          :visible-arrow="false"
          transition="slide-down-scale"
          v-model="userBoxShow"
          v-if="userData.isLogin"
        >
          <img class="avatar" :src="userData.headImage" :alt="userData.username" />
          <div class="username">{{ userData.username }}</div>
          <div
            class="btn user-box-btn"
            @click="
              userBoxShow = false;
              $router.myPush('/signed-list');
            "
          >
            签约记录
          </div>
          <div class="btn user-box-btn" @click="callLoginOut()">登出</div>

          <img class="avatar" :src="userData.headImage" :alt="userData.username" slot="reference" />
        </el-popover>

        <div class="user-btns" v-if="userData.isLogin === false">
          <div class="btn normal-btn" @click="callLogin()">登录</div>
          <div class="btn header-register-btn" @click="register()">注册</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { callLogin, callLoginOut } from "@/api/freelog";

export default {
  name: "MyHeader",

  data() {
    return {
      searchKey: "",
      searchHistory: [],
      userBoxShow: false,
      searchHistoryShow: false,
      searchWordCatch: null,
      tabList: [
        { value: "/home", label: "首页" },
        { value: "/voice-list", label: "声音" },
        { value: "/collection-list", label: "收藏" },
      ],
    };
  },

  watch: {
    "$route.path"(cur) {
      this.$nextTick(() => {
        const { inMobile, routerMode } = this.$store.state;
        if (cur !== "/search-list" || !inMobile) return;
        this.searchHistoryShow = routerMode === 1 || routerMode !== 2;
        if (routerMode === 1) this.$refs.searchInput.focus();
      });
    },

    searchHistoryShow(cur) {
      if (cur) {
        document.addEventListener("click", this.ifCloseHistoryPopup);
      } else {
        document.removeEventListener("click", this.ifCloseHistoryPopup);
      }
    },
  },

  computed: {
    /** 用户数据 */
    userData() {
      return this.$store.state.userData;
    },

    /** 当前路由 */
    currentPath() {
      return this.$route.path;
    },

    /** 搜索历史选项 */
    mySearchHistory() {
      return this.searchHistory.filter((item) => item.includes(this.searchKey));
    },

    /** 菜单按钮群 */
    menuBtnList() {
      return [
        { icon: "fl-icon-shouye", label: "首页", path: "/home" },
        { icon: "fl-icon-danji", label: "声音", path: "/voice-list" },
        {
          icon: "fl-icon-shoucangxiaoshuo",
          label: "我的收藏",
          hidden: !this.userData.isLogin,
          path: "/collection-list",
        },
        { icon: "fl-icon-lishi", label: "签约记录", hidden: !this.userData.isLogin, path: "/signed-list" },
      ];
    },
  },

  created() {
    this.searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  },

  methods: {
    callLogin,
    callLoginOut,

    /** 返回 */
    back() {
      const ONLY_PAGE = this.$store.state.locationHistory.length === 1;
      if (ONLY_PAGE) {
        this.$router.myPush("/home");
      } else {
        this.$router.back();
      }
    },

    /** 切换 tab 页 */
    toPage(path) {
      this.$router.myPush(path);
      this.searchKey = "";
      this.userBoxShow = false;
    },

    /** 输入搜索词 */
    searchKeyInput() {
      this.searchKey = (this.searchKey || "").trim();
      this.searchHistoryShow = true;
      this.searchWordCatch = null;
    },

    /** 点击历史搜索词 */
    clickSearchHistory(item) {
      this.searchKey = item;
      this.search();
    },

    /** 删除历史搜索词 */
    deleteSearchHistory(item) {
      this.deleteWord(item);
    },

    /** 搜索 */
    search() {
      if (!this.searchKey) {
        this.$router.myPush({ path: "/home" });
        return;
      }

      this.searchWord();
      this.$store.commit("setData", { key: "searchKey", value: this.searchKey });
      this.searchHistoryShow = false;
      if (!this.$store.state.inMobile) this.$router.myPush({ path: "/search-list" });
    },

    /** 搜索历史关键词 */
    selectTag(item) {
      this.searchKey = item;
      this.search();
    },

    /** 搜索框快捷键 */
    inputKeyUp(e) {
      switch (e.keyCode) {
        case 13:
          // 回车
          if (this.searchWordCatch !== null) {
            this.searchKey = this.mySearchHistory[this.searchWordCatch];
          }
          this.searchWordCatch = null;
          this.searchWord();
          this.search();
          break;
        case 27:
          // esc
          this.searchKey = "";
          this.searchWordCatch = null;
          this.searchHistoryShow = true;
          break;
        case 38:
          // 上
          if (this.searchWordCatch === null || this.searchWordCatch === 0) {
            this.searchWordCatch = null;
          } else {
            this.searchWordCatch = this.searchWordCatch - 1;
          }
          break;
        case 40:
          // 下
          this.searchHistoryShow = true;
          if (this.searchWordCatch === null) {
            this.searchWordCatch = 0;
          } else if (this.searchWordCatch !== this.mySearchHistory.length - 1) {
            this.searchWordCatch = this.searchWordCatch + 1;
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

    /** 搜索 */
    searchWord() {
      const keywords = this.searchKey.trim();
      if (!keywords) return;
      const index = this.searchHistory.findIndex((item) => item === keywords);
      if (index !== -1) this.searchHistory.splice(index, 1);
      if (this.searchHistory.length === 10) this.searchHistory.pop();
      this.searchHistory.unshift(keywords);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    /** 删除搜索词 */
    deleteWord(keywords) {
      const index = this.searchHistory.findIndex((item) => item === keywords);
      if (index === -1) return;
      this.searchHistory.splice(index, 1);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    /** 清空搜索词 */
    clearHistory() {
      localStorage.setItem("searchHistory", "[]");
      this.searchHistory = [];
    },

    /** 根据点击区域判断历史搜索框是否关闭 */
    ifCloseHistoryPopup(e) {
      if (!this.$refs.searchInput || !this.$refs.searchHistoryPopup) return;
      const clickInput = this.$refs.searchInput.contains(e.target);
      const clickPopup = this.$refs.searchHistoryPopup.contains(e.target);
      if (!clickInput && !clickPopup) {
        this.searchHistoryShow = false;
      } else {
        this.$refs.searchInput.focus();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/header";
</style>
