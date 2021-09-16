<template>
  <div class="detail-wrapper flex-column align-center">
    <!-- header -->
    <div class="header-wrapper p-fixed lt-0 w-100p h-72 b-box text-center z-100">
      <div class="w-100p mw-1200 h-100p flex-row align-center space-between">
        <i class="iconfont fs-20 fc-white" @click="switchPage('/')">
          &#xe699;
        </i>

        <div class="logo fs-22 fw-bold fc-white transition cur-pointer" @click="switchPage('/')">
          freelog comic
        </div>

        <div class="my-shelf fs-16 fw-bold fc-white fw-medium transition cur-pointer" @click="switchPage('/shelf')">
          我的漫画
        </div>
      </div>
    </div>

    <div class="bg-cover-box p-relative w-100p pb-75p over-h">
      <img class="bg-cover p-absolute lt-0 w-100p" v-lazy="comicInfo.coverImages[0]" v-if="comicInfo.coverImages" />
    </div>

    <!-- body -->
    <div class="body-wrapper w-100p b-box text-center z-1">
      <div class="w-100p mw-1200 pb-30">
        <!-- 书籍信息 -->
        <div class="body-info">
          <div class="book-cover-box brs-6 b-box bg-white">
            <div class="w-100p h-100p brs-4 over-h text-center">
              <img class="h-100p" v-lazy="comicInfo.coverImages[0]" v-if="comicInfo.coverImages" />
            </div>
          </div>

          <div class="book-content flex-column">
            <div class="book-name fw-bold text-ellipsis">
              {{ comicInfo.presentableTitle }}
            </div>

            <div class="book-author text-ellipsis mt">
              {{ comicInfo.username }}
            </div>

            <tags class="mt" :data="comicInfo.tags" size="large" />

            <div class="pc-btns mt">
              <div class="main-btn flex-1 mw-200 h-40" @click="switchPage('/reader', { id: comicInfo.presentableId })">
                <span>立即阅读</span>
              </div>

              <div
                class="collect-btn flex-1 mw-200 h-40 brs-4 ml-20 b-box bg-white text-center cur-pointer shrink-0 transition"
                :class="{ collect: isCollected }"
                @click="operateShelf(comicInfo)"
              >
                <i className="iconfont fs-20 mr-10">{{ isCollected ? "&#xe658;" : "&#xe64c;" }}</i>
                {{ isCollected ? "已追" : "追漫" }}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-30" v-if="comicInfo.intro || comicInfo.presentableTitle">
          <span class="book-intro fs-14 lh-25 cur-pointer transition" @click="modalShow = true">
            {{ comicInfo.intro || `${comicInfo.presentableTitle}-${comicInfo.username}` }}
          </span>
        </div>

        <div class="mobile-btns mt-25">
          <div class="main-btn flex-1 h-40" @click="switchPage('/reader', { id: comicInfo.presentableId })">
            <span>立即阅读</span>
          </div>

          <div
            class="collect-btn flex-1 h-40 brs-4 ml-20 b-box bg-white text-center cur-pointer shrink-0 transition"
            :class="{ collect: isCollected }"
            @click="operateShelf(comicInfo)"
          >
            <i className="iconfont fs-20 mr-10">{{ isCollected ? "&#xe658;" : "&#xe64c;" }}</i>
            {{ isCollected ? "已追" : "追漫" }}
          </div>
        </div>
      </div>
    </div>

    <intro-modal v-model:show="modalShow" :data="comicInfo" />
  </div>
</template>

<script lang="ts">
import { useMyRouter, useMyShelf } from "../utils/hooks";
import { ExhibitItem } from "@/utils/interface";
import { defineAsyncComponent, reactive, toRefs } from "@vue/runtime-core";
import { getExhibitsInfo, getInfo } from "@/api/freelog";

export default {
  name: "detail",

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
    "intro-modal": defineAsyncComponent(() => import("../components/intro-modal.vue")),
  },

  setup() {
    const { params, switchPage, routerBack } = useMyRouter();
    const { id } = params.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const data = reactive({
      comicInfo: {} as ExhibitItem,
      modalShow: false,
    });
    
    const getComicInfo = async (id: string) => {
      const resourceInfo = await getInfo(id, "getResourceInfoById");
      const comicInfo = await getExhibitsInfo(id);
      const { intro, username } = resourceInfo.data.data;
      data.comicInfo = { ...comicInfo.data.data, intro, username };
    };

    getComicInfo(id);

    return {
      ...toRefs(data),
      switchPage,
      routerBack,
      isCollected,
      operateShelf,
    };
  },
};
</script>

<style lang="scss" scoped>
.detail-wrapper {
  min-height: 100vh;
  background-image: url(../assets/image/bg.png);

  .header-wrapper {
    padding: 0 40px;
    box-shadow: 0 5px 9px #f9f9f9;
    background-color: #9ac9ff;

    .iconfont {
      display: none;
    }

    .logo {
      display: block;
      font-style: italic;
    }

    .logo,
    .my-shelf {
      text-shadow: 2px 2px 4px #6280a1;

      &:hover {
        text-shadow: 4px 4px 6px #6280a1;
      }
    }
  }

  .bg-cover-box {
    display: none;
    border-radius: 0 0 4px 4px;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
    }

    .bg-cover {
      filter: blur(3px);
    }
  }

  .body-wrapper {
    padding: 112px 40px 0;

    .pc-btns {
      display: flex;
    }

    .mobile-btns {
      display: none;
    }

    .body-info {
      display: flex;

      .book-cover-box {
        width: 400px;
        height: 300px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
      }

      .book-content {
        margin-left: 40px;
        flex: 1;
        width: 0;
        justify-content: center;

        .mt {
          margin-top: 25px;
        }

        .book-name {
          font-size: 30px;
        }

        .book-author {
          font-size: 24px;
        }
      }
    }

    .book-intro {
      color: #858c96;

      &:hover {
        color: #333;
      }

      &::after {
        content: "更多信息";
        margin-left: 10px;
        color: #333;
        font-weight: bold;
      }
    }

    .collect-btn {
      color: #4fa1ff;
      border: 1px solid #ddd;

      &:hover,
      &.collect {
        border-color: #4fa1ff;
      }
    }
  }
}

@media (max-width: 900px) {
  .book-cover-box {
    width: 300px !important;
    height: 225px !important;
  }
}

@media (max-width: 700px) {
  .book-content {
    justify-content: space-between !important;

    .mt {
      margin-top: 0 !important;
    }
  }

  .book-cover-box {
    width: 240px !important;
    height: 180px !important;
  }
}

@media (max-width: 550px) {
  .detail-wrapper {
    .header-wrapper {
      box-shadow: none;
      background-color: transparent;
      padding: 0 20px;

      .iconfont {
        display: block;
      }

      .logo {
        display: none;
      }
    }

    .bg-cover-box {
      display: block;
    }

    .body-wrapper {
      margin-top: -130px;
      padding: 0 20px;
      z-index: 1;

      .pc-btns {
        display: none;
      }

      .mobile-btns {
        display: flex;
      }

      .book-cover-box {
        width: 120px !important;
        height: 150px !important;
        box-shadow: 0 0 3px #fff !important;
        padding: 3px;
      }

      .book-content {
        margin-left: 20px !important;
        color: #fff;

        .book-name {
          font-size: 22px !important;
        }

        .book-author {
          font-size: 18px !important;
        }
      }
    }
  }
}
</style>
