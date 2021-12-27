<template>
  <teleport to="#modal">
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
      <div class="content-card" @click.stop v-if="currentId">
        <div class="content-area">
          <div class="title">{{ exhibitInfo?.exhibitName }}</div>
          <div class="exhibit-info">
            <img
              class="author-avatar"
              :src="getAvatarUrl(exhibitInfo?.userId)"
              v-if="exhibitInfo?.userId"
            />
            <div class="author-name">
              {{ exhibitInfo?.articleInfo.articleOwnerName }}
            </div>
            <tags
              :tags="exhibitInfo?.tags"
              @search="closePopup()"
              v-if="exhibitInfo?.tags.length"
            />
          </div>

          <div ref="contentArea" class="main-area">
            <template v-if="isAuth === true">
              <img
                :class="contentMode === 1 ? 'width-full' : 'height-full'"
                :src="content"
                :alt="exhibitInfo?.exhibitName"
                v-if="exhibitInfo?.articleInfo.resourceType === 'image'"
              />
              <video
                :class="contentMode === 1 ? 'width-full' : 'height-full'"
                :src="content"
                controls
                v-if="exhibitInfo?.articleInfo.resourceType === 'video'"
              ></video>
            </template>

            <div class="lock-box" v-if="isAuth === false">
              <i class="freelog fl-icon-zhanpinweishouquansuoding lock"></i>
              <div class="lock-tip">
                展品未开放授权，继续浏览请签约并获取授权
              </div>
              <div class="get-btn" @click="getAuth()">签约</div>
            </div>

            <div
              class="switch-btn previous"
              @click="switchExhibit('ArrowLeft')"
            >
              <i class="freelog fl-icon-zhankaigengduo"></i>
            </div>
            <div class="switch-btn next" @click="switchExhibit('ArrowRight')">
              <i class="freelog fl-icon-zhankaigengduo"></i>
            </div>
          </div>
        </div>

        <div class="recommend-area">
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
import {
  defineAsyncComponent,
  reactive,
  ref,
  SetupContext,
  toRefs,
  watch,
} from "vue";
import { ExhibitItem } from "../api/interface";
import { useGetList, useMyRouter } from "../utils/hooks";
import {
  addAuth,
  getExhibitAuthStatus,
  getExhibitFileStream,
  getExhibitInfo,
} from "@/api/freelog";

export default {
  name: "detail-popup",

  props: ["id", "listData"],

  emits: ["update:id", "search"],

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
    "my-frame": defineAsyncComponent(() => import("../components/frame.vue")),
  },

  setup(
    props: { id: string; listData: ExhibitItem[] },
    context: SetupContext<Record<string, any>>
  ) {
    const { switchPage } = useMyRouter();
    const datasOfGetList = useGetList();
    const contentArea = ref<any>(null);
    let heightList: number[] = [];

    const data = reactive({
      currentId: "",
      exhibitInfo: null as ExhibitItem | null,
      isAuth: null as boolean | null,
      content: "",
      contentMode: null as null | number, // 显示模式 1-宽撑满，高自适应 2-高撑满，宽自适应
      listNumber: 0,
      waterfall: {} as any,
      waterfallList: ["first", "second", "third", "fourth", "fifth"],
    });

    const methods = {
      // 获取头像
      getAvatarUrl(id: any) {
        return `https://image.freelog.com/headImage/${id}`;
      },

      // 切换图片
      switchExhibit(type: string) {
        const currentIndex = props.listData.findIndex(
          (item) => item.exhibitId === data.currentId
        );
        if (type === "ArrowLeft" && currentIndex !== 0)
          data.currentId = props.listData[currentIndex - 1].exhibitId;
        if (type === "ArrowRight" && currentIndex !== props.listData.length - 1)
          data.currentId = props.listData[currentIndex + 1].exhibitId;
      },

      // 搜索标签
      search(tag: string) {
        const query: { tags?: string } = { tags: tag };
        switchPage("/home", query);
      },

      closePopup() {
        data.currentId = "";
        context.emit("update:id", "");
        switchPage("/home", { id: "" }, 1);
      },

      // 授权
      async getAuth() {
        const authResult = await addAuth(data.currentId);
        const { status } = authResult;
        if (status === 0) getData();
      },
    };

    watch(
      () => props.id,
      (cur) => {
        data.currentId = cur;
        if (cur) {
          document.documentElement.scroll({ top: 0 });
          data.exhibitInfo = null;
          data.isAuth = false;
          data.content = "";
          data.waterfall = {};
          window.addEventListener("keyup", keyup);
          switchPage("/home", { id: data.currentId }, 1);
        } else {
          window.removeEventListener("keyup", keyup);
        }
      }
    );

    watch(
      () => data.currentId,
      (cur) => {
        if (!cur) return;

        getListNumber();
        getData();
      }
    );

    watch(
      () => datasOfGetList.listData.value,
      async (cur: ExhibitItem[]) => {
        initWaterfall();
        for (let i = 0; i < cur.length; i++) {
          const img = new Image();
          img.src = cur[i].coverImages[0];
          img.onload = () => {
            const height = (300 / img.width) * img.height;
            cur[i].height = height;

            if (i === cur.length - 1) setWaterFall();
          };
        }
      }
    );

    const keyup = (e: KeyboardEvent) => {
      if (e.key === "Escape") methods.closePopup();
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        methods.switchExhibit(e.key);
      }
    };

    // 根据屏幕宽度判断瀑布流列数
    const getListNumber = () => {
      const { clientWidth } = document.body;
      // 屏幕宽度小于等于 1600 时，显示 4 列，否则显示 5 列
      data.listNumber = clientWidth <= 1600 ? 4 : 5;
    };

    // 初始化瀑布流数据
    const initWaterfall = () => {
      heightList = [];
      data.waterfall = {};
      for (let i = 0; i < data.listNumber; i++) {
        data.waterfall[data.waterfallList[i]] = [] as ExhibitItem[];
      }
    };

    // 整理瀑布流数据
    const setWaterFall = () => {
      const GAP_HEIGHT = 10;
      for (let i = 0; i < datasOfGetList.listData.value.length; i++) {
        if (
          datasOfGetList.listData.value[i].exhibitId ===
          data.exhibitInfo?.exhibitId
        )
          continue;

        let minHeightItemIndex = 0;
        if (heightList.length && heightList.length < data.listNumber) {
          minHeightItemIndex = heightList.length;
        } else if (heightList.length === data.listNumber) {
          const minHeight = Math.min(...heightList);
          minHeightItemIndex = heightList.findIndex(
            (item) => item === minHeight
          );
        }

        data.waterfall[data.waterfallList[minHeightItemIndex]].push(
          datasOfGetList.listData.value[i]
        );
        heightList[minHeightItemIndex] =
          (heightList[minHeightItemIndex] || 0) +
          ((datasOfGetList.listData.value[i] as any).height || 0) +
          GAP_HEIGHT;
      }
    };

    // 获取资源内容
    const getData = async () => {
      const exhibitInfo = await getExhibitInfo(data.currentId, {
        isLoadVersionProperty: 1,
      });
      data.exhibitInfo = exhibitInfo.data.data;

      const statusInfo = await getExhibitAuthStatus(data.currentId);
      data.isAuth = statusInfo.data.data
        ? statusInfo.data.data[0].isAuth
        : false;
      if (data.isAuth) {
        const info: any = await getExhibitFileStream(data.currentId, true);
        if (!info) return;

        const resourceType = data.exhibitInfo?.articleInfo.resourceType;
        if (resourceType === "image") {
          const img = new Image();
          img.src = info;
          img.onload = () => {
            const { width, height } = img;
            const ratio = width / height;
            judgeContentMode(ratio, info);
          };
        } else if (resourceType === "video") {
          const video: HTMLVideoElement = document.createElement("video");
          video.src = info;
          video.onloadeddata = () => {
            const { videoWidth, videoHeight } = video;
            const ratio = videoWidth / videoHeight;
            judgeContentMode(ratio, info);
          };
        }
      } else {
        methods.getAuth();
      }

      datasOfGetList.getList(
        { tags: data.exhibitInfo?.tags.join(","), limit: 20 },
        true
      );
    };

    // 根据资源宽高比决定显示模式
    const judgeContentMode = (ratio: number, info: string) => {
      const { clientWidth, clientHeight } = contentArea.value;
      const areaRatio = clientWidth / clientHeight;
      data.contentMode = ratio > areaRatio ? 1 : 2;
      data.content = info;
    };

    return {
      ...toRefs(data),
      ...methods,
      contentArea,
    };
  },
};
</script>

<style lang="scss" scoped>
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

    .title {
      width: 1230px;
      font-size: 24px;
      font-weight: 600;
      color: #222222;
      line-height: 30px;
    }

    .exhibit-info {
      width: 1230px;
      display: flex;
      align-items: center;
      margin-top: 15px;

      .author-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
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

      .width-full {
        width: 100%;
      }

      .height-full {
        height: 100%;
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
        color: #999999;
        line-height: 20px;
        margin-top: 30px;
      }
    }
  }
}

@media (min-width: 1440px) {
  .content-area {
    padding: 30px 105px 55px !important;

    .title,
    .exhibit-info,
    .main-area {
      width: 100% !important;
    }
  }
}

@media (min-width: 1650px) {
  .content-area {
    padding: 30px 0 55px !important;

    .title,
    .exhibit-info,
    .main-area {
      width: 1540px !important;
    }
  }
}
</style>
