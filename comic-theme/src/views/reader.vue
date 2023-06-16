<template>
  <div
    class="reader-wrapper"
    :class="{
      'in-mobile': inMobile,
      light: theme === 'light',
      dark: theme === 'dark',
    }"
    @click="clickPage()"
  >
    <reader-header :comicInfo="comicInfo" :show="barShow" @changeBarShow="changeBarShow" />

    <my-loader v-if="loading" />

    <!-- mobile -->
    <template v-if="!loading && inMobile">
      <div class="mobile-body-wrapper">
        <template v-if="comicInfo.defaulterIdentityType === 0">
          <template v-if="mode[0] === 'paging'">
            <a-carousel :dots="false">
              <img
                class="swipe-image"
                v-lazy="item.url"
                oncontextmenu="return false"
                v-for="item in contentImgList"
                :key="item.name"
              />
            </a-carousel>
          </template>

          <template v-else-if="mode[0] === 'scroll'">
            <img
              class="content-image"
              v-lazy="item.url"
              oncontextmenu="return false"
              v-for="item in contentImgList"
              :key="item.name"
            />
          </template>
        </template>

        <template v-else-if="comicInfo.defaulterIdentityType">
          <div class="auth-box" v-if="comicInfo.defaulterIdentityType !== 4">
            <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
            <div class="auth-link-tip">授权链异常，无法查看</div>
            <div class="home-btn" @click="switchPage('/home')">进入首页</div>
          </div>

          <div class="lock-box" v-else-if="comicInfo.defaulterIdentityType === 4 || userData.isLogin === false">
            <img class="lock" src="../assets/images/lock.png" alt="未授权" />
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth()">获取授权</div>
          </div>
        </template>
      </div>

      <transition name="fade-down">
        <div class="mobile-operater-wrapper" @touchmove.prevent v-show="barShow">
          <div class="operate-btn" @click.stop="modeMenuShow = true">
            <i class="freelog fl-icon-shujia1"></i>
            <div class="operater-btn-label">阅读模式</div>
          </div>
          <div class="operate-btn" @click="operateShelf(comicInfo)">
            <i
              class="freelog"
              :class="`fl-icon-${isCollected ? 'shoucangxiaoshuoyishoucang' : 'shoucangxiaoshuo'}`"
            ></i>
            <div class="operater-btn-label">{{ isCollected ? "取消收藏" : "加入收藏" }}</div>
          </div>
        </div>
      </transition>

      <transition name="fade-down">
        <div class="mobile-mode-menu" @touchmove.prevent @click.stop v-if="modeMenuShow && barShow">
          <div class="menu-title">阅读模式</div>
          <div class="menu-btns">
            <div
              class="menu-btn"
              :class="{ active: mode[2] === 'normal' && mode[0] === 'paging' }"
              @click="changeMode('normal', 2)"
            >
              <i class="freelog fl-icon-xiangxia right"></i>
              <div class="btn-label">普通模式</div>
            </div>
            <div
              class="menu-btn"
              :class="{ active: mode[2] === 'manga' && mode[0] === 'paging' }"
              @click="changeMode('manga', 2)"
            >
              <i class="freelog fl-icon-xiangxia left"></i>
              <div class="btn-label">日漫模式</div>
            </div>
            <div class="menu-btn" :class="{ active: mode[0] === 'scroll' }" @click="changeMode('scroll', 0)">
              <i class="freelog fl-icon-xiangxia"></i>
              <div class="btn-label">滚动模式</div>
            </div>
          </div>
        </div>
      </transition>
    </template>

    <!-- PC -->
    <template v-if="!loading && !inMobile">
      <div class="body-area" :class="theme">
        <template v-if="comicInfo.defaulterIdentityType === 0">
          <div class="paging-mode-area" v-if="mode[0] === 'paging'">
            <!-- 页漫、双页模式、非跨页匹配、当前为首页时，首页左侧显示空屏 -->
            <div
              class="blank-screen"
              v-if="comicMode === 2 && mode[1] === 'double' && !amend && currentPage === 1"
            ></div>
            <!-- 日漫、双页模式、当前为尾页时，尾页左侧显示空屏 -->
            <div
              class="blank-screen"
              v-if="comicMode === 3 && mode[1] === 'double' && currentPage === contentImgList.length"
            ></div>
            <!-- 日漫、双页模式、跨页匹配/非跨页匹配且当前不为首页、当前页不为尾页时，当前页左侧显示下一页 -->
            <div
              class="content-image-box"
              v-if="
                comicMode === 3 &&
                  mode[1] === 'double' &&
                  (amend || (!amend && currentPage !== 1)) &&
                  currentPage !== contentImgList.length &&
                  nextUrl
              "
            >
              <img class="content-image" :src="nextUrl" />
            </div>
            <!-- 当前页 -->
            <div class="content-image-box" :class="{ single: mode[1] === 'single' }" v-if="currentUrl">
              <img class="content-image" :src="currentUrl" />
            </div>
            <!-- 页漫、双页模式、跨页匹配/非跨页匹配且当前不为首页、当前页不为尾页时，当前页右侧显示下一页 -->
            <div
              class="content-image-box"
              v-if="
                comicMode === 2 &&
                  mode[1] === 'double' &&
                  (amend || (!amend && currentPage !== 1)) &&
                  currentPage !== contentImgList.length &&
                  nextUrl
              "
            >
              <img class="content-image" :src="nextUrl" />
            </div>
            <!-- 页漫、双页模式、当前为尾页时，尾页右侧显示空屏 -->
            <div
              class="blank-screen"
              v-if="comicMode === 2 && mode[1] === 'double' && currentPage === contentImgList.length"
            ></div>
            <!-- 日漫、双页模式、非跨页匹配、当前为首页时，首页右侧显示空屏 -->
            <div
              class="blank-screen"
              v-if="mode[1] === 'double' && comicMode === 3 && !amend && currentPage === 1"
            ></div>

            <div
              class="pre-btn"
              @click="leftSwitchPage()"
              v-if="
                (currentPage !== 1 && mode[2] === 'normal') ||
                  (currentPage < contentImgList.length - (mode[1] === 'single' ? 0 : 1) && mode[2] === 'manga')
              "
            ></div>
            <div
              class="next-btn"
              @click="rightSwitchPage()"
              v-if="
                (currentPage < contentImgList.length - (mode[1] === 'single' ? 0 : 1) && mode[2] === 'normal') ||
                  (currentPage !== 1 && mode[2] === 'manga')
              "
            ></div>
          </div>

          <div class="scroll-mode-area" :style="{ height: totalHeight + 'px' }" v-else-if="mode[0] === 'scroll'">
            <img
              class="content-image"
              :style="{ height: item.height + 'px' }"
              v-lazy="item.url"
              oncontextmenu="return false"
              v-for="item in contentImgList"
              :key="item.name"
            />
          </div>
        </template>

        <template v-else-if="comicInfo.defaulterIdentityType">
          <div class="auth-box" v-if="comicInfo.defaulterIdentityType !== 4">
            <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
            <div class="auth-link-tip">授权链异常，无法查看</div>
            <div class="home-btn" @click="switchPage('/home')">进入首页</div>
          </div>

          <div class="lock-box" v-else-if="comicInfo.defaulterIdentityType === 4 || userData.isLogin === false">
            <img class="lock" src="../assets/images/lock.png" alt="未授权" />
            <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
            <div class="get-btn" @click="getAuth()">获取授权</div>
          </div>
        </template>
      </div>

      <div class="operater-wrapper">
        <div class="operater-btns-box">
          <operate-btn
            :icon="isCollected ? 'fl-icon-shoucangxiaoshuoyishoucang' : 'fl-icon-shoucangxiaoshuo'"
            :theme="theme"
            @click="
              clickPage();
              operateShelf(comicInfo);
            "
          />

          <operate-btn icon="fl-icon-fenxiang" :theme="theme" @click.stop="sharePopupShow = true">
            <share :show="sharePopupShow" :exhibit="comicInfo" />
          </operate-btn>

          <operate-btn
            :icon="theme === 'light' ? 'fl-icon-rijianmoshi' : 'fl-icon-yejianmoshi'"
            :theme="theme"
            @click="
              clickPage();
              setTheme();
            "
          />

          <back-top>
            <div class="back-top">
              <operate-btn icon="fl-icon-huidaodingbu" :theme="theme" />
            </div>
          </back-top>
        </div>
      </div>

      <div
        class="reader-footer"
        :class="{ show: barShow }"
        @mouseenter="changeBarShow(true)"
        @mouseleave="changeBarShow(false)"
      >
        <div class="footer-body">
          <div class="pager">
            当前页
            <!-- 页漫、翻页模式、双页模式、非跨页匹配、当前为首页时，左侧显示空屏页码 -->
            <span
              class="page-number"
              v-if="comicMode === 2 && mode[0] === 'paging' && mode[1] === 'double' && !amend && currentPage === 1"
            >
              -
            </span>
            <!-- 日漫、翻页模式、双页模式、当前为尾页时，左侧显示空屏页码 -->
            <span
              class="page-number"
              v-if="
                comicMode === 3 && mode[0] === 'paging' && mode[1] === 'double' && currentPage === contentImgList.length
              "
            >
              -
            </span>
            <!-- 日漫、翻页模式、双页模式、跨页匹配或非跨页匹配且当前不为首页时，左侧显示下一页页码 -->
            <span
              class="page-number"
              v-if="
                comicMode === 3 &&
                  mode[0] === 'paging' &&
                  mode[1] === 'double' &&
                  (amend || (!amend && currentPage !== 1)) &&
                  currentPage + 1 <= contentImgList.length
              "
            >
              {{ currentPage + 1 }}
            </span>
            <!-- 当前页页码 -->
            <span class="page-number">{{ currentPage }}</span>
            <!-- 页漫、翻页模式、双页模式、跨页匹配或非跨页匹配且当前不为首页时，左侧显示下一页页码 -->
            <span
              class="page-number"
              v-if="
                comicMode === 2 &&
                  mode[0] === 'paging' &&
                  mode[1] === 'double' &&
                  (amend || (!amend && currentPage !== 1)) &&
                  currentPage + 1 <= contentImgList.length
              "
            >
              {{ currentPage + 1 }}
            </span>
            <!-- 页漫、翻页模式、双页模式、当前为尾页时，右侧显示空屏页码 -->
            <span
              class="page-number"
              v-if="
                comicMode === 2 && mode[0] === 'paging' && mode[1] === 'double' && currentPage === contentImgList.length
              "
            >
              -
            </span>
            <!-- 日漫、翻页模式、双页模式、非跨页匹配、当前为首页时，右侧显示空屏页码 -->
            <span
              class="page-number"
              v-if="comicMode === 3 && mode[0] === 'paging' && mode[1] === 'double' && !amend && currentPage === 1"
            >
              -
            </span>
            <!-- 翻页模式、双页模式时，显示跨页匹配按钮 -->
            <div
              class="amend ghost-btn"
              @click="changeAmend(!amend)"
              v-if="mode[0] === 'paging' && mode[1] === 'double'"
            >
              更改跨页匹配
            </div>
          </div>
          <div class="jumper">
            <input class="page-number" v-model="jumpPage" @input="changeJumpPage" @keyup.enter="jump()" />
            <div class="page-total">/ {{ contentImgList.length }}</div>
            <div class="jump ghost-btn" @click="jump()">
              跳转
            </div>
          </div>
          <div class="mode ghost-btn" @click="modeMenuShow = !modeMenuShow">
            <i class="freelog fl-icon-shujia1" />
            阅读模式
          </div>

          <div
            class="mode-menu"
            @mouseenter="changeBarShow(true)"
            @mouseleave="changeBarShow(false)"
            v-show="modeMenuShow && barShow"
          >
            <div
              class="group"
              v-for="(group, index) in mode[0] === 'paging' ? modeMenu : [modeMenu[0]]"
              :key="group.title"
            >
              <div class="title">{{ group.title }}</div>
              <div class="btns">
                <div
                  class="btn"
                  :class="{ active: mode.includes(btn.value) }"
                  @click="changeMode(btn.value, index)"
                  v-for="btn in group.btns"
                  :key="btn.value"
                >
                  {{ btn.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="paging-tip" v-if="directionTipShow">
        <img
          class="img"
          :src="require(`../assets/images/${mode[2] === 'normal' ? 'left-to-right' : 'right-to-left'}.png`)"
        />
        <div class="desc">当前翻页方向</div>
        <div class="direction">{{ mode[2] === "normal" ? "从左向右" : "从右向左" }}</div>
      </div>
    </template>

    <directory :show="directoryShow" :comicInfo="comicInfo" @closeDirectory="directoryShow = false" />
  </div>
</template>

<script lang="tsx">
import { toRefs } from "@vue/reactivity";
import { useMyRouter, useMyScroll, useMyShelf } from "../utils/hooks";
import { defineAsyncComponent, nextTick, onUnmounted, reactive, watch, watchEffect } from "vue";
import { ContentImage, ExhibitItem } from "@/api/interface";
import { addAuth, getExhibitAuthStatus, getExhibitFileStream, getExhibitInfo } from "@/api/freelog";
import { useStore } from "vuex";

export default {
  name: "reader",

  components: {
    "reader-header": defineAsyncComponent(() => import("../components/reader-header.vue")),
    "operate-btn": defineAsyncComponent(() => import("../components/operate-btn.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    "back-top": defineAsyncComponent(() => import("../components/back-top.vue")),
    share: defineAsyncComponent(() => import("../components/share.vue")),
    directory: defineAsyncComponent(() => import("../components/directory.vue")),
  },

  setup() {
    type modeType = "paging" | "scroll" | "single" | "double" | "normal" | "manga";

    const myTheme = localStorage.getItem("theme") || "light";
    const store = useStore();
    const { query, switchPage } = useMyRouter();
    const { id } = query.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const { scrollTo, scrollTop, clientHeight } = useMyScroll();

    /** 阅读模式菜单 */
    const modeMenu: { title: string; btns: { label: string; value: modeType }[] }[] = [
      {
        title: "阅读模式",
        btns: [
          { label: "翻页", value: "paging" },
          { label: "滚动", value: "scroll" },
        ],
      },
      {
        title: "页面模式",
        btns: [
          { label: "单页", value: "single" },
          { label: "双页", value: "double" },
        ],
      },
      {
        title: "翻页方向",
        btns: [
          { label: "普通模式", value: "normal" },
          { label: "日漫模式", value: "manga" },
        ],
      },
    ];

    let barShowTimer: any = null;
    let tipTimer: any = null;

    const data = reactive({
      loading: false,
      comicInfo: {} as ExhibitItem,
      contentImgList: [] as ContentImage[],
      pagePointList: [] as number[],
      totalHeight: 0,
      comicMode: 0,
      currentPage: 1,
      currentUrl: "",
      nextUrl: "",
      jumpPage: 1,
      amend: false,
      theme: myTheme,
      mode: ["paging", "single", "normal"],
      modeMenuShow: false,
      directionTipShow: false,
      sharePopupShow: false,
      directoryShow: false,
      barShow: false,
    });

    const methods = {
      /** 点击页面 */
      clickPage() {
        if (data.sharePopupShow) data.sharePopupShow = false;
        if (store.state.inMobile) {
          data.barShow = !data.barShow;
          if (data.modeMenuShow) data.modeMenuShow = false;
        }
      },

      /** PC 端改变 header 与 footer 显示状态 */
      changeBarShow(show: boolean) {
        if (barShowTimer) {
          clearTimeout(barShowTimer);
          barShowTimer = null;
        }
        if (show) {
          data.barShow = true;
        } else {
          barShowTimer = setTimeout(() => {
            data.barShow = false;
            data.modeMenuShow = false;
          }, 3000);
        }
      },

      /** 切换主题模式 */
      setTheme() {
        data.theme = data.theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", data.theme);
      },

      /** 获取授权 */
      async getAuth() {
        const authResult = await addAuth(id);
        const { status } = authResult;
        if (status === 0) {
          getContent();
          refreshAuth();
        }
      },

      /** 输入跳转页数 */
      changeJumpPage(e: any) {
        const { value } = e.target;
        let jumpNumber = Number(value.replace(/[^0-9]/g, "")) || 0;
        if (jumpNumber < 1) {
          jumpNumber = 1;
        } else if (jumpNumber > data.contentImgList.length) {
          jumpNumber = data.contentImgList.length;
        }
        data.jumpPage = jumpNumber;
      },

      /** 切换阅读模式 */
      changeMode(value: modeType, index: number) {
        if (index && data.mode[0] !== "paging") {
          // 选择页面模式或翻页方向时，如果当前阅读模式不为翻页模式，则自动选择翻页模式
          data.mode[0] = "paging";
        }

        if (data.mode.includes(value)) return;

        if (index && data.mode[0] !== "paging") {
          // 选择页面模式或翻页方向时，如果当前阅读模式不为翻页模式，则自动选择翻页模式
          data.mode[0] = "paging";
        }

        data.mode[index] = value;

        if (value === "paging") {
          this.jump();
        } else if (value === "scroll") {
          this.getPointInScroll();
        } else if (data.mode[0] === "paging") {
          // 页漫时，将选择的模式保存在本地
          localStorage.setItem("comicReadMode", JSON.stringify(data.mode));
        }

        if (index === 2) {
          this.showDirectionTip();
        }
      },

      /** 显示翻页方向提示 */
      showDirectionTip() {
        if (tipTimer) {
          clearTimeout(tipTimer);
          data.directionTipShow = false;
        }

        setTimeout(() => {
          data.directionTipShow = true;
          tipTimer = setTimeout(() => {
            data.directionTipShow = false;
            tipTimer = null;
          }, 1600);
        }, 50);
      },

      /** 左侧切换页面 */
      leftSwitchPage() {
        data.mode[2] === "normal" ? this.pageForward() : this.pageBackward();
      },

      /** 右侧切换页面 */
      rightSwitchPage() {
        data.mode[2] === "normal" ? this.pageBackward() : this.pageForward();
      },

      /** 向前翻页 */
      pageForward() {
        const pageType = data.mode[1];
        let offset = pageType === "single" ? 1 : 2;
        if (!data.amend && pageType === "double" && data.currentPage === 2) {
          // 非跨页匹配、双页模式、当前页为第二页时，仅向前一页
          offset = 1;
        }
        const page = data.currentPage - offset;
        data.currentPage = page;
        data.jumpPage = page;
      },

      /** 向后翻页 */
      pageBackward() {
        const pageType = data.mode[1];
        let offset = pageType === "single" ? 1 : 2;
        if (!data.amend && pageType === "double" && data.currentPage === 1) {
          // 非跨页匹配、双页模式、当前页为第一页时，仅向后一页
          offset = 1;
        }
        const page = data.currentPage + offset;
        data.currentPage = page;
        data.jumpPage = page;
      },

      /** 更改跨页匹配 */
      changeAmend(value: boolean) {
        let page;
        if (data.currentPage === 1) {
          page = 1;
        } else if (value) {
          page = data.currentPage === data.contentImgList.length ? data.currentPage - 1 : data.currentPage + 1;
        } else {
          page = data.currentPage - 1;
        }
        data.currentPage = page;
        data.jumpPage = page;
        data.amend = value;
      },

      /** 跳转 */
      jump() {
        let page = data.jumpPage;

        if (data.mode[0] === "paging" && data.mode[1] === "double") {
          // 翻页模式、双页模式下，需对跳转页码进行修正
          if (page === 1) {
            data.currentPage = page;
            data.jumpPage = page;
            return;
          } else if (data.amend) {
            // 跨页匹配时，页码显示双页的奇数页码
            page = data.jumpPage % 2 ? data.jumpPage : data.jumpPage - 1;
          } else {
            // 非跨页匹配时，页码显示双页的偶数页码
            page = data.jumpPage % 2 ? data.jumpPage - 1 : data.jumpPage;
          }
        } else if (data.mode[0] === "scroll") {
          setTimeout(() => {
            scrollTo(data.pagePointList[page - 1], "auto");
          }, 0);
        }
        data.currentPage = page;
        data.jumpPage = page;
      },

      /** 滚动模式下获取每页的位置 */
      getPointInScroll() {
        data.pagePointList = [];
        data.totalHeight = 0;
        const WIDTH = 1000;
        data.contentImgList.forEach((item) => {
          data.pagePointList.push(data.totalHeight);
          const { width, height } = item;
          const currentHeight = (WIDTH / width) * height;
          item.width = 1000;
          item.height = currentHeight;
          data.totalHeight += currentHeight;
        });
        this.jump();
      },
    };

    /** 获取漫画信息 */
    const getComicInfo = async () => {
      const exhibitInfo = await getExhibitInfo(id, { isLoadVersionProperty: 1 });
      data.comicInfo = exhibitInfo.data.data;
      const { resourceType } = exhibitInfo.data.data.articleInfo;
      if (resourceType[2] === "条漫") {
        data.comicMode = 1;
      } else if (resourceType[2] === "页漫") {
        data.comicMode = 2;
      } else if (resourceType[2] === "日漫") {
        data.comicMode = 3;
      }
      getContent();
    };

    /** 获取漫画内容 */
    const getContent = async () => {
      data.loading = true;
      const statusInfo = await getExhibitAuthStatus(id);
      if (statusInfo.data.data) data.comicInfo.defaulterIdentityType = statusInfo.data.data[0].defaulterIdentityType;

      if (data.comicInfo.defaulterIdentityType === 0) {
        // 已签约并且授权链无异常
        const info: any = await getExhibitFileStream(id, { subFilePath: "index.json" });
        if (info.status !== 200) {
          data.loading = false;
          return;
        }

        data.contentImgList = info.data.list;
        data.currentUrl = data.contentImgList[0].url;
      }

      data.loading = false;

      if (data.comicMode === 1) {
        // 条漫时，自动选择滚动模式
        methods.changeMode("scroll", 0);
      } else if ([2, 3].includes(data.comicMode)) {
        // 页漫/日漫时，自动选择翻页模式（如本地有记录翻页模式的选择，优先取本地记录的模式）
        const comicReadMode = localStorage.getItem("comicReadMode");
        if (comicReadMode) data.mode = JSON.parse(comicReadMode);
      }
    };

    /** 刷新授权状态 */
    const refreshAuth = () => {
      const { authIds, myShelf } = store.state;
      authIds.push(id);
      store.commit("setData", { key: "authIds", value: authIds });
      const index = myShelf.findIndex((item: ExhibitItem) => item.exhibitId === id);
      if (index !== -1) {
        myShelf[index].defaulterIdentityType = 0;
        store.commit("setData", { key: "myShelf", value: myShelf });
      }
    };

    watchEffect(() => {
      document.body.style.overflowY = data.directoryShow && store.state.inMobile ? "hidden" : "auto";
    });

    watch(
      () => scrollTop.value,
      (cur) => {
        if (data.mode[0] !== "scroll") return;

        if (data.barShow) {
          clearTimeout(barShowTimer);
          barShowTimer = null;
          data.barShow = false;
        }

        const height = clientHeight.value || 0;
        const offset = height * 0.3;
        let page = 1;
        for (let i = 0; i < data.pagePointList.length; i++) {
          if (cur + offset >= data.pagePointList[i]) {
            page = i + 1;
          } else {
            break;
          }
        }
        if (page !== data.currentPage) {
          data.currentPage = page;
          data.jumpPage = page;
        }
      }
    );

    watch(
      () => data.currentPage,
      (cur) => {
        data.currentUrl = "";
        data.nextUrl = "";
        const { contentImgList } = data;
        nextTick(() => {
          data.currentUrl = contentImgList[cur - 1].url;
          if (cur <= contentImgList.length) {
            data.nextUrl = contentImgList[cur].url;
          }
        });
      }
    );

    onUnmounted(() => {
      if (barShowTimer) {
        clearTimeout(barShowTimer);
        barShowTimer = null;
      }
      if (tipTimer) {
        clearTimeout(tipTimer);
        tipTimer = null;
      }
    });

    getComicInfo();

    return {
      ...toRefs(store.state),
      switchPage,
      isCollected,
      operateShelf,
      modeMenu,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.reader-wrapper {
  min-height: 100vh;
  background-color: #fafbfc;
  transition: all 0.2s linear;

  &.dark {
    background-color: #2e2e2e;
  }

  &.light {
    background-color: #e9e9e9;
  }

  .header {
    transform: translateY(-100%);
  }

  // mobile 主题内容区
  .mobile-body-wrapper {
    width: 100%;
    height: 100%;
    animation: fade-in 0.3s ease-out;
    // .ant-carousel :deep(.slick-slide) {
    //   height: 100vh;
    //   overflow: hidden;
    // }

    // .ant-carousel :deep(.slick-slide h3) {
    //   color: #fff;
    // }

    .swipe-image {
      width: 100%;
      height: 100vh;
      object-fit: contain;
    }

    .content-image {
      width: 100%;
    }

    .auth-box {
      width: 100%;
      padding: 110px 0;
      display: flex;
      flex-direction: column;
      align-items: center;

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

      .home-btn {
        padding: 9px 20px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 20px;
        background-color: #f2f2f2;
        color: #666;
        margin-top: 30px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }

        &:active {
          opacity: 0.6;
        }
      }
    }

    .lock-box {
      width: 100%;
      padding: 110px 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      .lock {
        width: 48px;
        height: 48px;
      }

      .lock-tip {
        font-size: 16px;
        color: #999999;
        line-height: 22px;
        margin-top: 30px;
      }

      .get-btn {
        padding: 9px 20px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 20px;
        font-weight: bold;
        background-color: #2784ff;
        color: #fff;
        margin-top: 30px;
        cursor: pointer;

        &:hover {
          background-color: #529dff;
        }

        &:active {
          background-color: #2376e5;
        }
      }
    }
  }

  // PC 主题内容区
  .body-area {
    width: 100%;

    .paging-mode-area {
      position: relative;
      width: 100%;
      height: 100vh;
      display: flex;

      .blank-screen {
        flex: 1;
        width: 0;
        height: 100%;
      }

      .content-image-box {
        flex: 1;
        width: 0;
        height: 100%;
        display: flex;
        animation: fade-in 0.1s linear;

        &:first-child {
          justify-content: flex-end;
        }

        &:last-child {
          justify-content: flex-start;
        }

        &.single {
          justify-content: center;
        }

        .content-image {
          height: 100%;
        }
      }

      .pre-btn {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 50%;
        cursor: url(../assets/images/pre-mouse.png), auto;
      }

      .next-btn {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        right: 0;
        cursor: url(../assets/images/next-mouse.png), auto;
      }
    }

    .scroll-mode-area {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      .content-image {
        width: 1000px;
      }
    }

    .auth-box {
      width: 100%;
      padding: 110px 0;
      display: flex;
      flex-direction: column;
      align-items: center;

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

      .home-btn {
        padding: 9px 20px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 20px;
        background-color: #f2f2f2;
        color: #666;
        margin-top: 30px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }

        &:active {
          opacity: 0.6;
        }
      }
    }

    .lock-box {
      width: 100%;
      padding: 110px 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      .lock {
        width: 48px;
        height: 48px;
      }

      .lock-tip {
        font-size: 16px;
        color: #999999;
        line-height: 22px;
        margin-top: 30px;
      }

      .get-btn {
        padding: 9px 20px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 20px;
        font-weight: bold;
        background-color: #2784ff;
        color: #fff;
        margin-top: 30px;
        cursor: pointer;

        &:hover {
          background-color: #529dff;
        }

        &:active {
          background-color: #2376e5;
        }
      }
    }

    .footer-bar {
      height: 78px;
      margin: 30px 0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      transition: all 0.2s linear;

      .footer-btn {
        flex: 1;
        font-size: 16px;
        line-height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s linear;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }

        & + .footer-btn {
          border-left: 1px solid rgba(0, 0, 0, 0.2);
        }
      }
    }
  }

  // mobile 操作按钮群
  .mobile-operater-wrapper {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;

    .operate-btn {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ffffff;

      .freelog {
        width: 18px;
        height: 18px;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .operater-btn-label {
        font-size: 10px;
        line-height: 16px;
        transform: scale(0.83);
        margin-top: 4px;
      }
    }
  }

  // mobile 阅读模式菜单
  .mobile-mode-menu {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 135px;
    padding: 0 20px;
    box-sizing: border-box;
    background: #4f4f4f;
    border-radius: 10px 10px 0px 0px;

    .menu-title {
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: #999999;
      line-height: 17px;
      margin-top: 20px;
    }

    .menu-btns {
      width: 100%;
      display: flex;
      margin-top: 20px;

      .menu-btn {
        flex: 1;
        height: 48px;
        border-radius: 4px;
        border: 1px solid #999999;
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: #999999;
        display: flex;
        align-items: center;
        justify-content: center;

        &.active {
          color: #2784ff;
          border: 1px solid #2784ff;
        }

        & + .menu-btn {
          margin-left: 10px;
        }

        .freelog {
          font-size: 12px;

          &.left {
            transform: rotate(90deg);
          }

          &.right {
            transform: rotate(-90deg);
          }
        }

        .btn-label {
          margin-left: 3px;
        }
      }
    }
  }

  // PC 操作按钮群
  .operater-wrapper {
    position: fixed;
    bottom: 100px;
    right: 40px;

    .operater-btns-box {
      position: absolute;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .back-top {
        margin-top: 10px;
      }

      .share-wrapper {
        right: 100%;
        top: 50%;
        margin-top: -140px;
        margin-right: 20px;
      }
    }
  }

  // 脚部操作栏
  .reader-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 70px;

    &.show .footer-body {
      transform: translateY(0);
    }

    .footer-body {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      padding: 0 40px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      transform: translateY(70px);
      transition: all 0.1s ease;

      .pager {
        flex: 1;
        font-size: 14px;
        color: #ffffff;
        display: flex;
        align-items: center;

        .page-number {
          width: 30px;
          height: 32px;
          background-color: #222;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #ffffff;
          margin-left: 10px;

          & + .page-number {
            margin-left: 5px;
          }
        }

        .amend {
          position: relative;
          margin-left: 20px;
          z-index: 1;
        }
      }

      .jumper {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .page-number {
          width: 40px;
          height: 32px;
          box-sizing: border-box;
          background: #d9d9d9;
          border-radius: 4px;
          border: none;
          outline: none;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #222;
          margin-left: 10px;
        }

        .page-total {
          font-size: 14px;
          color: #999999;
          line-height: 20px;
          margin-left: 5px;
        }

        .jump {
          margin-left: 20px;
        }
      }

      .mode {
        position: relative;
        display: flex;
        align-items: center;
        z-index: 1;

        .freelog {
          font-size: 16px;
          margin-right: 5px;
          font-weight: normal;
        }
      }

      .mode-menu {
        position: absolute;
        right: 40px;
        bottom: 80px;
        width: 247px;
        padding: 20px;
        box-sizing: border-box;
        background: #4f4f4f;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
        border-radius: 10px;

        .group {
          & + .group {
            margin-top: 25px;
          }

          .title {
            font-size: 12px;
            color: #999999;
            line-height: 17px;
          }

          .btns {
            margin-top: 15px;
            display: flex;

            .btn {
              flex: 1;
              height: 38px;
              background: transparent;
              border-radius: 4px;
              border: 1px solid #999999;
              font-size: 14px;
              font-weight: 600;
              color: #999999;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.1s ease;
              cursor: pointer;

              &:hover {
                border: 1px solid #fff;
                color: #fff;
              }

              &:active,
              &.active {
                border: 1px solid #2784ff;
                color: #2784ff;
              }

              & + .btn {
                margin-left: 15px;
              }
            }
          }
        }
      }
    }
  }

  .paging-tip {
    position: fixed;
    bottom: 150px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 220px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 10px;
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: tip 1.6s linear both;

    .img {
      width: 110px;
      height: 60px;
    }

    .desc {
      font-size: 14px;
      color: #c7c7c7;
      line-height: 20px;
      margin-top: 28px;
    }

    .direction {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      line-height: 33px;
      margin-top: 19px;
    }
  }

  .ghost-btn {
    padding: 6px 15px;
    background: #666;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    line-height: 20px;
    cursor: pointer;

    &:hover {
      color: rgba(255, 255, 255, 1);
      background: #999;
    }

    &:active {
      color: rgba(255, 255, 255, 0.7);
      background: #666;
    }
  }

  @keyframes tip {
    0% {
      opacity: 0;
    }
    18.75% {
      opacity: 1;
    }
    81.25% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* fade-up */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.1s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* fade-down */
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.1s ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
