<!-- 详情页 -->

<template>
  <div class="mobile-detail-wrapper" v-if="inMobile">
    <my-header />

    <div
      class="main-area"
      key="mainArea"
      :style="{
        height: exhibitInfo?.defaulterIdentityType >= 4 ? '460px' : contentHeight + 'px'
      }"
    >
      <my-loader v-if="loading" />
      <transition-group name="content-fade">
        <template v-if="exhibitInfo?.articleInfo?.status === 1">
          <template v-if="!loading">
            <div v-if="exhibitInfo.onlineStatus === 0">
              <div class="exceptional-box">
                <div class="icon">
                  <i class="freelog fl-icon-a-yichang_tupianshipinmanhuaziyuan freeze"> </i>
                </div>

                <span class="exceptional-text"> 作品已下架，无法访问 </span>
              </div>
            </div>

            <div v-else-if="![0, 4].includes(exhibitInfo?.defaulterIdentityType)">
              <div class="exceptional-box">
                <div class="icon">
                  <i class="freelog fl-icon-a-yichang_tupianshipinmanhuaziyuan freeze"> </i>
                </div>

                <span class="exceptional-text"> 作品异常，无法访问 </span>
              </div>
            </div>

            <!-- 静默签约 -->
            <template
              v-else-if="exhibitInfo?.defaulterIdentityType === 0 && userData.isLogin === false"
            >
              <img :src="content" v-if="exhibitInfo?.articleInfo.resourceType.includes('图片')" />
              <video
                :src="content"
                controls
                muted
                autoplay
                webkit-playsinline
                playsinline
                v-else-if="exhibitInfo?.articleInfo.resourceType.includes('视频')"
              ></video>
            </template>

            <div
              class="lock-box"
              v-else-if="exhibitInfo?.defaulterIdentityType === 4 || userData.isLogin === false"
            >
              <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
              <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
              <div class="get-btn" @click="getAuth()">获取授权</div>
            </div>

            <div v-else-if="!['图片', '视频'].includes(exhibitInfo?.articleInfo.resourceType[0])">
              <div class="exceptional-box">
                <div class="icon">
                  <i class="freelog fl-icon-yichang_wenjiangeshicuowu freeze"> </i>
                </div>

                <span class="exceptional-text">此作品格式暂不支持访问 </span>
              </div>
            </div>

            <template v-else-if="exhibitInfo?.defaulterIdentityType === 0">
              <img :src="content" v-if="exhibitInfo?.articleInfo.resourceType.includes('图片')" />
              <video
                :src="content"
                controls
                muted
                autoplay
                webkit-playsinline
                playsinline
                v-else-if="exhibitInfo?.articleInfo.resourceType.includes('视频')"
              ></video>
            </template>
          </template>
        </template>

        <template v-else>
          <div class="freeze-exhibit">
            <div class="icon">
              <i class="freelog fl-icon-a-yichang_tupianshipinmanhuaziyuan freeze"> </i>
            </div>
            <span class="exceptional-text"> 此作品因违规无法访问 </span>
          </div>
        </template>
      </transition-group>

      <template v-if="listData.length > 1">
        <div
          class="switch-btn previous"
          @click="switchExhibit('ArrowLeft')"
          v-if="listData.length && exhibitInfo?.exhibitId !== listData[0].exhibitId"
        >
          <i class="freelog fl-icon-zhankaigengduo"></i>
        </div>
        <div
          class="switch-btn next"
          @click="switchExhibit('ArrowRight')"
          v-if="
            listData.length && exhibitInfo?.exhibitId !== listData[listData.length - 1].exhibitId
          "
        >
          <i class="freelog fl-icon-zhankaigengduo"></i>
        </div>
      </template>
    </div>

    <div class="other-area" key="otherArea">
      <div class="detail-info">
        <div class="title-box">
          <div class="title">{{ exhibitInfo?.exhibitTitle }}</div>
          <div class="offline" v-if="exhibitInfo?.onlineStatus === 0">已下架</div>
        </div>
        <tags :tags="exhibitInfo?.tags" v-if="exhibitInfo?.tags.length" />
        <div class="bottom-bar">
          <div class="author-info">
            <img
              class="author-avatar"
              :src="getAvatarUrl(exhibitInfo?.articleInfo.articleOwnerId)"
              v-if="exhibitInfo?.articleInfo.articleOwnerId"
            />
            <div class="author-name">
              {{ exhibitInfo?.articleInfo.articleOwnerName }}
            </div>
          </div>
          <div class="share-btn" @click="share()">
            <span class="share-btn-text"><i class="freelog fl-icon-fenxiang"></i>分享</span>
          </div>
          <input id="href" class="hidden-input" :value="href" readOnly />
        </div>
      </div>

      <div class="recommend-area" v-if="recommendShow">
        <div class="title">相关推荐</div>

        <div class="recommend-list">
          <div class="waterfall" v-for="list in listNumber" :key="list">
            <my-frame
              :data="item"
              v-for="item in waterfall[waterfallList[list - 1]]"
              :key="item.exhibitId"
              @click="switchPage('/detail', { id: item.exhibitId })"
            />
          </div>
        </div>

        <div class="text-btn mobile" @click="closePopup()">浏览更多>></div>
      </div>
    </div>

    <my-footer />
  </div>

  <!-- PC -->
  <teleport to="#modal" v-if="!inMobile">
    <transition name="fade">
      <div
        class="modal"
        v-if="currentId"
        @click="closePopup()"
        @touchmove.prevent.passive
        @scroll.stop.prevent
      >
        <div class="close-btn" @click="closePopup()" v-if="currentId">
          <i class="freelog fl-icon-guanbi"></i>
        </div>
      </div>
    </transition>

    <transition name="slide-up">
      <div ref="scrollArea" class="content-card" @click.stop v-if="currentId">
        <div class="content-area">
          <div class="title-box">
            <div class="box-left">
              <div class="title">{{ exhibitInfo?.exhibitTitle }}</div>
              <div class="offline" v-if="exhibitInfo?.onlineStatus === 0">已下架</div>
            </div>

            <div
              class="share-btn"
              @mouseenter.stop="setShareWidgetShow(true)"
              @mouseleave.stop="setShareWidgetShow(false)"
            >
              <span class="share-btn-text" :class="{ active: shareShow }">
                <i class="freelog fl-icon-fenxiang"></i>分享
              </span>

              <div id="share" class="share-wrapper" />
            </div>
          </div>
          <div class="exhibit-info">
            <img
              class="author-avatar"
              :src="getAvatarUrl(exhibitInfo?.articleInfo.articleOwnerId)"
              v-if="exhibitInfo?.articleInfo.articleOwnerId"
            />
            <div class="author-name">
              {{ exhibitInfo?.articleInfo.articleOwnerName }}
            </div>

            <tags
              :tags="exhibitInfo?.tags"
              :shouldCalculateWidth="true"
              v-if="exhibitInfo?.tags.length"
              @updateTotalWidth="handleUpdateWidth"
            />

            <div class="more-tag" v-if="showMoreTagBtn">
              更多>>
              <div class="more-tag-popup">
                <tags :tags="exhibitInfo?.tags" />
              </div>
            </div>
          </div>

          <div ref="contentArea" class="main-area">
            <my-loader v-if="loading" />

            <transition-group name="content-fade">
              <template v-if="!loading">
                <template v-if="exhibitInfo?.articleInfo?.status === 1">
                  <div v-if="exhibitInfo.onlineStatus === 0">
                    <div class="exceptional-box">
                      <div class="icon">
                        <i class="freelog fl-icon-a-yichang_tupianshipinmanhuaziyuan freeze"> </i>
                      </div>

                      <span class="exceptional-text"> 作品已下架，无法访问 </span>
                    </div>
                  </div>

                  <div v-else-if="![0, 4].includes(exhibitInfo?.defaulterIdentityType)">
                    <div class="exceptional-box">
                      <div class="icon">
                        <i class="freelog fl-icon-a-yichang_tupianshipinmanhuaziyuan freeze"> </i>
                      </div>

                      <span class="exceptional-text"> 作品异常，无法访问 </span>
                    </div>
                  </div>

                  <!-- 静默签约 -->
                  <template
                    v-else-if="
                      exhibitInfo?.defaulterIdentityType === 0 &&
                      contentMode &&
                      userData.isLogin === false
                    "
                  >
                    <img
                      :class="{
                        'width-full': contentMode === 1,
                        'height-full': contentMode === 2
                      }"
                      :src="content"
                      oncontextmenu="return false"
                      v-if="exhibitInfo?.articleInfo.resourceType.includes('图片')"
                    />
                    <video
                      :class="{
                        'width-full': contentMode === 1,
                        'height-full': contentMode === 2
                      }"
                      :src="content"
                      controls
                      controlslist="nodownload"
                      oncontextmenu="return false"
                      v-else-if="exhibitInfo?.articleInfo.resourceType.includes('视频')"
                    ></video>
                  </template>

                  <div
                    class="lock-box"
                    v-else-if="
                      exhibitInfo?.defaulterIdentityType === 4 || userData.isLogin === false
                    "
                  >
                    <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
                    <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
                    <div class="get-btn" @click="getAuth()">获取授权</div>
                  </div>

                  <div
                    v-else-if="!['图片', '视频'].includes(exhibitInfo?.articleInfo.resourceType[0])"
                  >
                    <div class="exceptional-box">
                      <div class="icon">
                        <i class="freelog fl-icon-yichang_wenjiangeshicuowu freeze"> </i>
                      </div>

                      <span class="exceptional-text">此作品格式暂不支持访问 </span>
                    </div>
                  </div>

                  <template v-else-if="exhibitInfo?.defaulterIdentityType === 0 && contentMode">
                    <img
                      :class="{
                        'width-full': contentMode === 1,
                        'height-full': contentMode === 2
                      }"
                      :src="content"
                      oncontextmenu="return false"
                      v-if="exhibitInfo?.articleInfo.resourceType.includes('图片')"
                    />
                    <video
                      :class="{
                        'width-full': contentMode === 1,
                        'height-full': contentMode === 2
                      }"
                      :src="content"
                      controls
                      controlslist="nodownload"
                      oncontextmenu="return false"
                      v-else-if="exhibitInfo?.articleInfo.resourceType.includes('视频')"
                    ></video>
                  </template>
                </template>

                <template v-else>
                  <div class="freeze-exhibit">
                    <div class="icon">
                      <i class="freelog fl-icon-a-yichang_tupianshipinmanhuaziyuan freeze"> </i>
                    </div>
                    <span class="exceptional-text"> 此作品因违规无法访问 </span>
                  </div>
                </template>
              </template>
            </transition-group>

            <div
              class="switch-btn previous"
              @click="switchExhibit('ArrowLeft')"
              v-if="listData.length && exhibitInfo?.exhibitId !== listData[0].exhibitId"
            >
              <i class="freelog fl-icon-zhankaigengduo"></i>
            </div>
            <div
              class="switch-btn next"
              @click="switchExhibit('ArrowRight')"
              v-if="
                listData.length &&
                exhibitInfo?.exhibitId !== listData[listData.length - 1].exhibitId
              "
            >
              <i class="freelog fl-icon-zhankaigengduo"></i>
            </div>
          </div>
        </div>

        <div class="recommend-area" v-if="recommendShow">
          <div class="recommend-box">
            <div class="title">相关推荐</div>

            <div class="recommend-list">
              <div class="waterfall" v-for="list in listNumber" :key="list">
                <my-frame
                  :data="item"
                  v-for="item in waterfall[waterfallList[list - 1]]"
                  :key="item.exhibitId"
                  @click="currentId = item.exhibitId"
                />
              </div>
            </div>

            <div class="text-btn" @click="closePopup()">浏览更多>></div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { SetupContext, defineAsyncComponent, onUnmounted, reactive, ref, toRefs, watch } from "vue";
import { ExhibitItem } from "../api/interface";
import { useGetList, useMyRouter, useMyWaterfall } from "../utils/hooks";
import { useStore } from "vuex";
import { showToast } from "@/utils/common";
import { WidgetController, freelogApp } from "freelog-runtime";

export default {
  name: "detail",

  props: ["id"],

  emits: ["update:id", "search", "refreshAuth"],

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
    "my-frame": defineAsyncComponent(() => import("../components/frame.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue"))
  },

  setup(props: { id: string }, context: SetupContext) {
    const store = useStore();
    const { route, query, switchPage } = useMyRouter();
    const datasOfGetList = useGetList();
    const { listNumber, waterfall, waterfallList, getListNumber, initWaterfall, setWaterFall } =
      useMyWaterfall();
    const scrollArea = ref<any>(null);
    const contentArea = ref<any>(null);
    const showMoreTagBtn = ref<boolean>();

    const data = reactive({
      loading: false,
      currentId: "",
      exhibitInfo: null as ExhibitItem | null,
      content: "",
      contentMode: null as null | number, // 显示模式 1-宽撑满，高自适应 2-高撑满，宽自适应
      contentHeight: 460,
      recommendShow: false,
      shareShow: false,
      href: "",
      shareWidget: null as WidgetController | null
    });

    const methods = {
      /** 移动端分享 */
      share() {
        const input: any = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        // freelogApp.pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: data.exhibitInfo?.exhibitId } });
      },

      /** 获取用户头像 */
      getAvatarUrl(id: number) {
        return `https://image.freelog.com/avatar/${id}`;
      },

      /** 切换图片 */
      switchExhibit(type: string) {
        const currentIndex = store.state.listData.findIndex(
          (item: ExhibitItem) => item.exhibitId === data.currentId
        );
        if (type === "ArrowLeft" && currentIndex !== 0)
          data.currentId = store.state.listData[currentIndex - 1].exhibitId;
        if (type === "ArrowRight" && currentIndex !== store.state.listData.length - 1)
          data.currentId = store.state.listData[currentIndex + 1].exhibitId;
      },

      /** 搜索标签 */
      search(tag: string) {
        const query: { tags?: string } = { tags: tag };
        switchPage("/home", query);
      },

      /** 关闭详情弹窗 */
      closePopup() {
        if (store.state.inMobile) {
          switchPage("/home");
        } else {
          data.shareWidget?.unmount();
          data.currentId = "";
          context.emit("update:id", "");
          switchPage(route.path, { id: "" }, "replace");
          showMoreTagBtn.value = false;
        }
      },

      /** 授权 */
      async getAuth() {
        window.removeEventListener("keyup", keyup);
        const authResult = await freelogApp.addAuth(data.currentId, { immediate: true });
        window.addEventListener("keyup", keyup);
        const { status } = authResult;
        if (status === 0) {
          getData();
          refreshAuth();
        }
      },

      /** 控制分享弹窗显示 */
      setShareWidgetShow(value: boolean) {
        data.shareWidget?.setData({ show: value });
      }
    };

    /** 快捷键 */
    const keyup = (e: KeyboardEvent) => {
      if (e.key === "Escape") methods.closePopup();
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        methods.switchExhibit(e.key);
      }
    };

    /** 获取资源内容 */
    const getData = async () => {
      data.loading = true;

      const [exhibitInfo, statusInfo] = await Promise.all([
        freelogApp.getExhibitInfo(data.currentId, { isLoadVersionProperty: 1 }),
        freelogApp.getExhibitAuthStatus(data.currentId)
      ]);
      const { defaulterIdentityType = -1 } = statusInfo.data.data[0];

      data.exhibitInfo = { ...exhibitInfo.data.data, defaulterIdentityType };

      data.href = freelogApp.getCurrentUrl();
      mountShareWidget();

      if (![0, 4].includes(defaulterIdentityType)) {
        // 授权链异常
        data.loading = false;
      } else if (defaulterIdentityType === 0) {
        // 已签约并且授权链无异常
        const info = await freelogApp.getExhibitFileStream(data.currentId, { returnUrl: true });
        if (!info) {
          data.loading = false;
          return;
        }

        const resourceType = data.exhibitInfo?.articleInfo.resourceType || ([] as string[]);
        if (resourceType.includes("图片")) {
          const img = new Image();
          img.src = info;
          img.onload = () => {
            const { width, height } = img;
            const ratio = width / height;
            judgeContentHeight(ratio);
            judgeContentMode(ratio);
            data.content = info;
            data.loading = false;
          };
          img.onerror = event => {
            console.log(event);
            data.loading = false;
          };
        } else if (resourceType.includes("视频")) {
          const video: HTMLVideoElement = document.createElement("video");
          video.src = info;
          const ready = () => {
            const { videoWidth, videoHeight } = video;
            const ratio = videoWidth / videoHeight;
            judgeContentHeight(ratio);
            judgeContentMode(ratio);
            data.content = info;
            data.loading = false;
          };
          // 正常视频加载完成
          video.onloadeddata = ready;
          // onloadeddata 在 ios 不触发，onprogress 为了解决 ios 无法播放视频问题
          video.onprogress = ready;
          video.onerror = event => {
            console.log(event);
            data.loading = false;
          };
        } else {
          data.loading = false;
        }
      } else if (defaulterIdentityType === 4) {
        // 未签约并且授权链无异常
        data.loading = false;
        methods.getAuth();
      } else {
        data.loading = false;
      }

      datasOfGetList.getList({ tags: data.exhibitInfo?.tags.join(","), limit: 20 }, true);
    };

    /** 根据资源宽高比决定显示模式 */
    const judgeContentMode = (ratio: number) => {
      if (!store.state.inMobile) {
        const { clientWidth, clientHeight } = contentArea.value;
        const areaRatio = clientWidth / clientHeight;
        data.contentMode = ratio > areaRatio ? 1 : 2;
      }
    };

    /** 根据资源宽高比计算实际高度 */
    const judgeContentHeight = (ratio: number) => {
      if (store.state.inMobile) {
        data.contentHeight = 460;
        const { clientWidth } = window.document.body;
        data.contentHeight = clientWidth / ratio;
      }
    };

    /** 屏幕尺寸变化切换瀑布流列数 */
    const waterfallResize = () => {
      getListNumber();
      initWaterfall();
      setWaterFall(
        datasOfGetList.listData.value.filter(
          item => item.exhibitId !== data.currentId
        ) as ExhibitItem[]
      );
      data.recommendShow = datasOfGetList.listData.value.length !== 0;
    };

    /** 刷新授权状态 */
    const refreshAuth = () => {
      const { inMobile } = store.state;
      if (inMobile) {
        const { authIds } = store.state;
        authIds.push(data.exhibitInfo?.exhibitId);
        store.commit("setData", { key: "authIds", value: authIds });
      } else {
        context.emit("refreshAuth");
      }
    };

    /** 加载分享插件 */
    const mountShareWidget = async () => {
      if (store.state.inMobile) return;

      const container = document.getElementById("share");
      if (!container) return;

      if (data.shareWidget) await data.shareWidget.unmount();

      const subDeps = await freelogApp.getSelfDependencyTree();
      const widgetData = subDeps.find(item => item.articleName === "ZhuC/Freelog插件-展品分享");
      if (!widgetData) return;

      const { articleId, parentNid, nid } = widgetData;
      const topExhibitId = freelogApp.getTopExhibitId();

      const type = data.exhibitInfo?.articleInfo.resourceType.includes("图片") ? "图片" : "视频";
      const params = {
        articleId,
        parentNid,
        nid,
        topExhibitId,
        container,
        renderWidgetOptions: {
          data: { exhibit: data.exhibitInfo, type, routerType: "detail" }
        }
        // widget_entry: "https://localhost:8201",
      };
      data.shareWidget = await freelogApp.mountArticleWidget(params);
    };

    const handleUpdateWidth = (width: number) => {
      let authorAvatarWidth = 0;
      let authorNameWidth = 0;
      if (data.exhibitInfo?.articleInfo.articleOwnerId) {
        const avatarElement = document.querySelector(".author-avatar") as HTMLElement;
        authorAvatarWidth = avatarElement.offsetWidth;
      }

      if (data.exhibitInfo?.articleInfo.articleOwnerName) {
        const authorElement = document.querySelector(".exhibit-info .author-name") as HTMLElement;
        authorNameWidth = authorElement.offsetWidth;
      }

      const leftWidth = authorAvatarWidth + 10 + authorNameWidth + 30; // 头像和名称的宽度
      const middleWidth = ((data?.exhibitInfo?.tags?.length ?? 1) - 1) * 5 + width; // 标签宽度

      if (leftWidth + middleWidth > 1230) {
        showMoreTagBtn.value = true;
      } else {
        showMoreTagBtn.value = false;
      }
    };

    watch(
      () => props.id,
      cur => {
        data.currentId = cur;
      },
      {
        immediate: true
      }
    );

    watch(
      () => query.value.id,
      cur => {
        data.currentId = cur;
      },
      { immediate: true }
    );

    watch(
      () => data.currentId,
      cur => {
        if (cur) {
          data.exhibitInfo = null;
          data.content = "";
          window.addEventListener("keyup", keyup);
          getListNumber();
          getData();
          if (!store.state.inMobile) {
            const path = route.path === "/detail" ? "/home" : route.path;
            switchPage(path, { id: data.currentId }, "replace");
          } else {
            switchPage("/detail", { id: data.currentId });
          }

          setTimeout(() => {
            if (store.state.inMobile) {
              const app = document.getElementById("app");
              app && (app.scrollTop = 0);
            }
            if (scrollArea.value) scrollArea.value.scrollTop = 0;
          }, 0);
        } else {
          window.removeEventListener("keyup", keyup);
        }
      },
      { immediate: true }
    );

    watch(
      () => datasOfGetList.listData.value,
      async (cur: any) => {
        initWaterfall();

        const { inMobile } = store.state;
        let num = 0;
        let frameWidth = 0;
        let minHeight = 0;

        if (inMobile) {
          frameWidth = (document.body.clientWidth - 40) / 2;
          minHeight = 120;
        } else {
          frameWidth = 300;
          minHeight = 230;
        }

        for (let i = 0; i < cur.length; i++) {
          const img = new Image();
          img.src = cur[i].coverImages[0];
          img.onload = () => {
            const height = (frameWidth / img.width) * img.height;
            cur[i].height = height < minHeight ? minHeight : height;
            num++;

            if (num === cur.length)
              setWaterFall(cur.filter((item: ExhibitItem) => item.exhibitId !== data.currentId));
          };
        }
        data.recommendShow = cur.length > 1;
      }
    );

    window.addEventListener("resize", waterfallResize);
    onUnmounted(() => {
      window.removeEventListener("resize", waterfallResize);
    });

    return {
      ...toRefs(store.state),
      switchPage,
      listNumber,
      waterfall,
      waterfallList,
      ...toRefs(data),
      ...methods,
      scrollArea,
      contentArea,
      showMoreTagBtn,
      handleUpdateWidth
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/detail";
</style>
