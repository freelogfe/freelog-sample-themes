<template>
  <div class="mobile-detail-wrapper" v-if="inMobile">
    <my-header />

    <div
      class="main-area"
      key="mainArea"
      :style="{ height: exhibitInfo?.authCode === 303 ? '460px' : contentHeight + 'px' }"
    >
      <my-loader v-if="loading" />

      <transition-group name="content-fade">
        <template v-if="!loading && [200, 301].includes(exhibitInfo?.authCode) && exhibitInfo?.authLinkNormal">
          <img :src="content" v-if="exhibitInfo?.articleInfo.resourceType === 'image'" />
          <video
            :src="content"
            controls
            muted
            autoplay
            webkit-playsinline
            playsinline
            v-if="exhibitInfo?.articleInfo.resourceType === 'video'"
          ></video>
        </template>

        <div class="auth-box" v-if="!loading && !exhibitInfo?.authLinkNormal">
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
          <div class="auth-link-tip">授权链异常，无法查看</div>
          <div class="home-btn" @click="switchPage('/home')">进入首页</div>
        </div>

        <div class="lock-box" v-if="!loading && exhibitInfo?.authCode === 303 && exhibitInfo?.authLinkNormal">
          <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
          <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
          <div class="get-btn" @click="getAuth()">获取授权</div>
        </div>
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
          v-if="listData.length && exhibitInfo?.exhibitId !== listData[listData.length - 1].exhibitId"
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
        <div class="author-info">
          <img class="author-avatar" :src="getAvatarUrl(exhibitInfo?.userId)" v-if="exhibitInfo?.userId" />
          <div class="author-name">
            {{ exhibitInfo?.articleInfo.articleOwnerName }}
          </div>
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
      <div class="modal" v-if="currentId" @click="closePopup()" @touchmove.prevent.passive @scroll.stop.prevent>
        <div class="close-btn" @click="closePopup()" v-if="currentId">
          <i class="freelog fl-icon-guanbi"></i>
        </div>
      </div>
    </transition>

    <transition name="slide-up">
      <div ref="scrollArea" class="content-card" @click.stop v-if="currentId">
        <div class="content-area">
          <div class="title-box">
            <div class="title">{{ exhibitInfo?.exhibitTitle }}</div>
            <div class="offline" v-if="exhibitInfo?.onlineStatus === 0">已下架</div>
          </div>
          <div class="exhibit-info">
            <img class="author-avatar" :src="getAvatarUrl(exhibitInfo?.userId)" v-if="exhibitInfo?.userId" />
            <div class="author-name">
              {{ exhibitInfo?.articleInfo.articleOwnerName }}
            </div>
            <tags :tags="exhibitInfo?.tags" @search="closePopup()" v-if="exhibitInfo?.tags.length" />
          </div>

          <div ref="contentArea" class="main-area">
            <my-loader v-if="loading" />

            <transition-group name="content-fade">
              <template v-if="!loading">
                <template
                  v-if="[200, 301].includes(exhibitInfo?.authCode) && exhibitInfo?.authLinkNormal && contentMode"
                >
                  <img
                    :class="{
                      'width-full': contentMode === 1,
                      'height-full': contentMode === 2,
                    }"
                    :src="content"
                    v-if="exhibitInfo?.articleInfo.resourceType === 'image'"
                  />
                  <video
                    :class="{
                      'width-full': contentMode === 1,
                      'height-full': contentMode === 2,
                    }"
                    :src="content"
                    controls
                    v-if="exhibitInfo?.articleInfo.resourceType === 'video'"
                  ></video>
                </template>

                <div class="auth-box" v-if="!exhibitInfo?.authLinkNormal">
                  <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" />
                  <div class="auth-link-tip">授权链异常，无法查看</div>
                  <div class="home-btn" @click="closePopup()">进入首页</div>
                </div>

                <div class="lock-box" v-if="exhibitInfo?.authCode === 303 && exhibitInfo?.authLinkNormal">
                  <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
                  <div class="lock-tip">展品未开放授权，继续浏览请签约并获取授权</div>
                  <div class="get-btn" @click="getAuth()">获取授权</div>
                </div>
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
              v-if="listData.length && exhibitInfo?.exhibitId !== listData[listData.length - 1].exhibitId"
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
import { defineAsyncComponent, onUnmounted, reactive, ref, SetupContext, toRefs, watch } from "vue";
import { ExhibitItem } from "../api/interface";
import { useGetList, useMyRouter, useMyWaterfall } from "../utils/hooks";
import {
  addAuth,
  getExhibitAuthStatus,
  getExhibitAvailable,
  getExhibitFileStream,
  getExhibitInfo,
} from "@/api/freelog";
import { useStore } from "vuex";

export default {
  name: "detail",

  props: ["id"],

  emits: ["update:id", "search", "refreshAuth"],

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
    "my-frame": defineAsyncComponent(() => import("../components/frame.vue")),
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
  },

  setup(props: { id: string }, context: SetupContext<Record<string, any>>) {
    const store = useStore();
    const { route, query, switchPage } = useMyRouter();
    const datasOfGetList = useGetList();
    const { listNumber, waterfall, waterfallList, getListNumber, initWaterfall, setWaterFall } = useMyWaterfall();
    const scrollArea = ref<any>(null);
    const contentArea = ref<any>(null);

    const data = reactive({
      loading: false,
      currentId: "",
      exhibitInfo: null as ExhibitItem | null,
      content: "",
      contentMode: null as null | number, // 显示模式 1-宽撑满，高自适应 2-高撑满，宽自适应
      contentHeight: 460,
      recommendShow: false,
    });

    const methods = {
      // 获取头像
      getAvatarUrl(id: any) {
        return `https://image.freelog.com/headImage/${id}`;
      },

      // 切换图片
      switchExhibit(type: string) {
        const currentIndex = store.state.listData.findIndex((item: ExhibitItem) => item.exhibitId === data.currentId);
        if (type === "ArrowLeft" && currentIndex !== 0)
          data.currentId = store.state.listData[currentIndex - 1].exhibitId;
        if (type === "ArrowRight" && currentIndex !== store.state.listData.length - 1)
          data.currentId = store.state.listData[currentIndex + 1].exhibitId;
      },

      // 搜索标签
      search(tag: string) {
        const query: { tags?: string } = { tags: tag };
        switchPage("/home", query);
      },

      closePopup() {
        data.currentId = "";
        context.emit("update:id", "");
        switchPage(route.path, { id: "" }, "replace");
      },

      // 授权
      async getAuth() {
        window.removeEventListener("keyup", keyup);
        const authResult = await addAuth(data.currentId);
        window.addEventListener("keyup", keyup);
        const { status } = authResult;
        if (status === 0) {
          getData();
          refreshAuth();
        }
      },
    };

    const keyup = (e: KeyboardEvent) => {
      if (e.key === "Escape") methods.closePopup();
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        methods.switchExhibit(e.key);
      }
    };

    // 获取资源内容
    const getData = async () => {
      data.loading = true;
      const exhibitInfo = await getExhibitInfo(data.currentId, {
        isLoadVersionProperty: 1,
      });
      data.exhibitInfo = exhibitInfo.data.data as ExhibitItem;

      const statusInfo = await getExhibitAuthStatus(data.currentId);
      if (statusInfo.data.data) data.exhibitInfo.authCode = statusInfo.data.data[0].authCode;
      const authLinkStatusInfo = await getExhibitAvailable(data.currentId);
      if (authLinkStatusInfo.data.data) {
        data.exhibitInfo.authLinkNormal =
          data.exhibitInfo.authCode === 301 ? false : authLinkStatusInfo.data.data[0].isAuth;
      }

      if (!data.exhibitInfo.authLinkNormal) {
        // 授权链异常
        data.loading = false;
      } else if ([200, 301].includes(data.exhibitInfo.authCode)) {
        // 已签约并且授权链无异常
        const info: any = await getExhibitFileStream(data.currentId, true);
        if (!info) {
          data.loading = false;
          return;
        }

        const resourceType = data.exhibitInfo.articleInfo.resourceType;
        if (resourceType === "image") {
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
        } else if (resourceType === "video") {
          const video: HTMLVideoElement = document.createElement("video");
          video.src = info;
          video.onloadeddata = () => {
            const { videoWidth, videoHeight } = video;
            const ratio = videoWidth / videoHeight;
            judgeContentHeight(ratio);
            judgeContentMode(ratio);
            data.content = info;
            data.loading = false;
          };
        }
      } else if (data.exhibitInfo.authCode === 303) {
        // 未签约并且授权链无异常
        data.loading = false;
        methods.getAuth();
      }

      datasOfGetList.getList({ tags: data.exhibitInfo.tags.join(","), limit: 20 }, true);
    };

    // 根据资源宽高比决定显示模式
    const judgeContentMode = (ratio: number) => {
      if (!store.state.inMobile) {
        const { clientWidth, clientHeight } = contentArea.value;
        const areaRatio = clientWidth / clientHeight;
        data.contentMode = ratio > areaRatio ? 1 : 2;
      }
    };

    // 根据资源宽高比计算实际高度
    const judgeContentHeight = (ratio: number) => {
      if (store.state.inMobile) {
        data.contentHeight = 460;
        const { clientWidth } = window.document.body;
        data.contentHeight = clientWidth / ratio;
      }
    };

    // 屏幕尺寸变化切换瀑布流列数
    const waterfallResize = () => {
      getListNumber();
      initWaterfall();
      setWaterFall(datasOfGetList.listData.value.filter((item) => item.exhibitId !== data.currentId));
      data.recommendShow = datasOfGetList.listData.value.length !== 0;
    };

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

    watch(
      () => props.id,
      (cur) => {
        data.currentId = cur;
      }
    );

    watch(
      () => query.value.id,
      (cur) => {
        data.currentId = cur;
      },
      { immediate: true }
    );

    watch(
      () => data.currentId,
      (cur) => {
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
              (app as any).scrollTop = 0;
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
      async (cur: ExhibitItem[]) => {
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

            if (num === cur.length) setWaterFall(cur.filter((item) => item.exhibitId !== data.currentId));
          };
        }
        data.recommendShow = cur.length !== 0;
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
    };
  },
};
</script>

<style lang="scss" scoped>
// mobile
.mobile-detail-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding-bottom: 98px;

  .main-area {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fafbfc;

    .loader-wrapper {
      position: absolute;
      transform: scale(0.6);
    }

    img,
    video {
      width: 100%;
    }

    .auth-box {
      width: 100%;
      height: 460px;
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
      height: 460px;
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
        color: #9aa7bb;
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
        cursor: pointer;

        &:hover {
          background-color: #529dff;
        }

        &:active {
          background-color: #2376e5;
        }
      }
    }

    .switch-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 60px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      z-index: 0;

      .freelog {
        width: 12px;
        height: 26px;
        font-size: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &.previous {
        left: 15px;

        .freelog {
          transform: rotate(180deg);
        }
      }

      &.next {
        right: 15px;
      }
    }
  }

  .other-area {
    width: 100%;
    padding: 0 15px;
    box-sizing: border-box;

    .detail-info {
      padding: 20px 0;

      .title-box {
        display: flex;
        align-items: center;

        .title {
          max-width: 100%;
          font-size: 16px;
          font-weight: 600;
          color: #222222;
          line-height: 22px;
          height: 22px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .offline {
          width: 40px;
          height: 20px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: #ffffff;
          margin-left: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .tags-wrapper {
        margin-top: 10px;
        height: 24px;
        overflow: hidden;
      }

      .author-info {
        display: flex;
        align-items: center;
        margin-top: 12px;

        .author-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid #ebecf0;
        }

        .author-name {
          font-size: 12px;
          color: #999;
          line-height: 18px;
          margin-left: 5px;
        }
      }
    }

    .recommend-area {
      width: 100%;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;

      .title {
        width: 100%;
        font-size: 16px;
        font-weight: bold;
        color: #222222;
        line-height: 22px;
        margin: 20px 0;
      }

      .recommend-list {
        width: 100%;
        display: flex;

        .waterfall {
          flex: 1;

          & + .waterfall {
            margin-left: 10px;
          }

          .frame-wrapper + .frame-wrapper {
            margin-top: 10px;
          }
        }
      }

      .text-btn {
        font-size: 14px;
        line-height: 20px;
        margin: 30px 0;
      }
    }
  }
}

// PC
.modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 100;

  .close-btn {
    position: absolute;
    right: 20px;
    top: 10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 102;

    .freelog {
      font-size: 12px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.content-card {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100vh - 50px);
  border-radius: 20px 20px 0 0;
  background-color: #fff;
  overflow-y: auto;
  z-index: 101;

  .content-area {
    padding: 30px 0 55px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;

    .title-box {
      width: 1230px;
      display: flex;
      align-items: center;

      .title {
        max-width: 100%;
        font-size: 24px;
        font-weight: 600;
        color: #222222;
        line-height: 30px;
        height: 30px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .offline {
        width: 40px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        color: #ffffff;
        margin-left: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .exhibit-info {
      width: 1230px;
      display: flex;
      align-items: center;
      margin-top: 15px;
      height: 34px;

      .author-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid #ebecf0;
      }

      .author-name {
        font-size: 14px;
        font-weight: 600;
        color: #222222;
        line-height: 20px;
        margin-left: 10px;
      }

      .tags-wrapper {
        margin-left: 30px;
        height: 24px;
        overflow: hidden;
      }
    }

    .main-area {
      position: relative;
      width: 1230px;
      min-height: 600px;
      max-height: 750px;
      height: calc(100vh - 300px);
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fafbfc;
      border-radius: 10px;
      margin-top: 30px;
      overflow: hidden;

      .loader-wrapper {
        position: absolute;
        inset: 0;
      }

      .width-full {
        width: 100%;
      }

      .height-full {
        height: 100%;
      }

      .auth-box {
        width: 100%;
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
        display: flex;
        flex-direction: column;
        align-items: center;

        .lock {
          width: 48px;
          height: 48px;
          font-size: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9aa7bb;
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

      .switch-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 60px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s linear;

        &:hover {
          background: rgba(0, 0, 0, 0.4);
        }

        .freelog {
          width: 12px;
          height: 26px;
          font-size: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.previous {
          left: 15px;

          .freelog {
            transform: rotate(180deg);
          }
        }

        &.next {
          right: 15px;
        }
      }

      &:hover .switch-btn {
        opacity: 1;
      }
    }
  }

  .recommend-area {
    width: 100%;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0 0 100px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;

    .recommend-box {
      display: flex;
      flex-direction: column;
      align-items: center;

      .title {
        width: 100%;
        font-size: 30px;
        font-weight: 400;
        color: #222222;
        line-height: 100px;
      }

      .recommend-list {
        display: flex;

        .waterfall {
          width: 300px;

          & + .waterfall {
            margin-left: 10px;
          }

          .frame-wrapper + .frame-wrapper {
            margin-top: 10px;
          }
        }
      }

      .text-btn {
        font-size: 14px;
        line-height: 20px;
        margin-top: 30px;
      }
    }
  }
}

@media (min-width: 1440px) {
  .content-area {
    padding: 30px 105px 55px !important;

    .title-box,
    .exhibit-info,
    .main-area {
      width: 100% !important;
    }
  }
}

@media (min-width: 1650px) {
  .content-area {
    padding: 30px 0 55px !important;

    .title-box,
    .exhibit-info,
    .main-area {
      width: 1540px !important;
    }
  }
}

/* content-fade */
.content-fade-enter-active {
  transition: all 1s ease;
}
.content-fade-enter-from {
  opacity: 0;
}
</style>
