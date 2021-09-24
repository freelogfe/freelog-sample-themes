<template>
  <div class="reader-wrapper text-center transition" :class="theme" @click="barShow = !barShow">
    <!-- header -->
    <div
      class="header p-fixed lt-0 w-100p flex-row align-center space-between h-73 px-16 b-box transition z-100"
      :class="{ hide: !barShow }"
      @mouseover="barShow = true"
      @mouseout="barShow = false"
    >
      <div class="flex-row align-center">
        <div class="logo flex-row align-center cur-pointer transition" @click="switchPage(`/`)">
          <i class="iconfont fs-26 ml-14">
            &#xe663;
          </i>

          <div class="logo-text fw-bold fs-22 ml-10 mt--3">
            freelog comic
          </div>
        </div>

        <div class="ml-20 fs-16 flex-row">
          <div class="link cur-pointer transition" @click="switchPage('/detail', { id: comicInfo.presentableId })">
            {{ comicInfo.presentableTitle }}
          </div>
        </div>
      </div>

      <div class="link fs-16 cur-pointer mr-56 transition" @click="switchPage(`/shelf`)">
        我的漫画
      </div>
    </div>

    <!-- body -->
    <div class="content">
      <img class="w-100p" :src="content" v-if="content" />
    </div>

    <!-- operater -->
    <div class="fixed-operater p-fixed" :class="barShow ? 'show' : 'hide'">
      <back-top class="mb-24">
        <operate-btn icon="&#xe600;" :theme="theme" />
      </back-top>

      <operate-btn icon="&#xe6f1;" :theme="theme" @click.stop />

      <operate-btn :icon="isCollected ? '&#xe658;' : '&#xe64c;'" :theme="theme" @click.stop="operateShelf(comicInfo)" />

      <operate-btn
        :icon="theme === 'light' ? '&#xe65f;' : '&#xe68f;'"
        :theme="theme"
        @click.stop="theme = theme === 'light' ? 'dark' : 'light'"
      />
    </div>

    <!-- footer -->
    <transition name="slide-up">
      <div class="footer p-fixed lb-0 w-100p h-56 text-center z-100 transition" @click.stop v-if="barShow">
        <div class="flex-1 text-center-column" @click="switchPage('/')">
          <i class="iconfont fs-20 lh-20">&#xe663;</i>
          <div class="fs-12 mt-3">首页</div>
        </div>

        <div class="flex-1 text-center-column" @click="switchPage('/detail', { id: comicInfo.presentableId })">
          <div class="detail-icon p-relative w-20 h-20 brs-4 text-center over-h">
            <img class="h-100p" v-lazy="comicInfo.coverImages[0]" v-if="comicInfo.coverImages" />
          </div>

          <div class="fs-12 mt-3">详情</div>
        </div>

        <div class="shelf-btn w-200 h-35 brs-40 fs-15 text-center mx-20 transition" @click="switchPage(`/shelf`)">
          我的漫画
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="tsx">
import { toRefs } from "@vue/reactivity";
import { useMyRouter, useMyShelf } from "../utils/hooks";
import { defineAsyncComponent, reactive } from "vue";
import { ExhibitItem } from "../utils/interface";
import { getResourceName } from "../utils/common";
import { getExhibitsInfo, getInfo } from "../api/freelog";

export default {
  name: "reader",

  components: {
    "operate-btn": defineAsyncComponent(() => import("../components/operate-btn.vue")),
    "back-top": defineAsyncComponent(() => import("../components/back-top.vue")),
  },

  setup() {
    const { params, switchPage } = useMyRouter();
    const { id } = params.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const data = reactive({
      content: "",
      chapterId: "",
      comicInfo: {} as ExhibitItem,
      theme: "dark",
      barShow: false,
      directoryShow: false,
      searchKey: "",
    });

    const getComic = async (id: string) => {
      const exhibitInfo = await getExhibitsInfo(id, {
        isLoadVersionProperty: 1,
        isLoadCustomPropertyDescriptors: 1,
        isLoadResourceDetailInfo: 1,
        isLoadResourceVersionInfo: 1,
      });
      data.comicInfo = exhibitInfo.data.data;
      const content: any = await getInfo("getFileStreamById", [id, true]);
      data.content = content;
    };

    getComic(id);

    return {
      ...toRefs(data),
      switchPage,
      isCollected,
      operateShelf,
      getResourceName,
    };
  },
};
</script>

<style lang="scss" scoped>
.reader-wrapper {
  min-height: 100vh;

  &.light {
    background-color: #d2e6ff;

    .header {
      color: #fff;
      background-color: rgba(154, 201, 255, 0.9);

      .link {
        display: block;
      }

      .logo:hover,
      .link:hover {
        color: #fff !important;
        text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);
      }
    }

    .next-btn {
      background-color: #444;
      color: #ccc;
    }

    .footer {
      box-shadow: 0 -1px 10px #ffffff;
      color: #4fa1ff;
      background-color: #fff;

      .shelf-btn {
        background-color: #4fa1ff;
        color: #fff;
      }
    }
  }

  &.dark {
    background-color: #3e3e46;

    .header {
      color: #9f9fa3;
      background-color: rgba(31, 31, 31, 0.9);

      .link {
        display: block;
      }

      .logo:hover,
      .link:hover {
        color: #fff !important;
      }
    }

    .next-btn {
      background-color: #444;
      color: #ccc;
    }

    .footer {
      box-shadow: 0 -1px 20px #1f1f1f;
      background-color: #3e3e46;
      color: #9f9fa3;

      .detail-icon::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(159, 159, 163, 0.3);
      }

      .shelf-btn {
        background-color: #9f9fa3;
        color: #1f1f1f;
      }
    }
  }

  .header {
    .logo-text {
      font-style: italic;
    }

    &.hide {
      background-color: transparent !important;

      .link {
        display: none !important;
      }
    }
  }

  .content {
    width: 800px;

    .body {
      .next-btn {
        background-color: #4fa1ff;
        color: #fff;
      }

      .no-more {
        color: #5d646e;
      }
    }
  }

  .fixed-operater {
    left: 50%;
    bottom: 48px;
    margin-left: 450px;
  }

  .footer {
    display: none !important;
    border-radius: 10px 10px 0 0;
    opacity: 0.9;
  }
}

@media (max-width: 1365px) {
  .reader-wrapper {
    .content {
      width: 760px;
    }

    .fixed-operater {
      margin-left: 430px;
    }
  }
}

@media (max-width: 1023px) {
  .reader-wrapper {
    .content {
      width: 560px;
    }

    .fixed-operater {
      margin-left: 330px;
    }
  }
}

@media (max-width: 767px) {
  .reader-wrapper {
    .header {
      display: none !important;
    }

    .content {
      width: 100%;
    }

    .fixed-operater {
      left: calc(100% - 60px);
      bottom: 80px;
      margin-left: 0;

      ::v-deep .operate-btn-wrapper {
        box-shadow: 1px 1px 3px #ccc;
        width: 40px !important;
        height: 40px !important;

        & + .operate-btn-wrapper {
          margin-top: 16px !important;
        }

        .iconfont {
          font-size: 18px !important;
        }
      }

      &.show {
        display: block;
      }

      &.hide {
        display: none;
      }
    }

    .footer {
      display: flex !important;
    }
  }
}
</style>
