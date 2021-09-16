<template>
  <teleport to="#modal">
    <transition name="fade">
      <div
        class="modal p-fixed full lt-0 z-100 cur-pointer"
        v-if="show"
        @click="$emit('update:show', false)"
        @touchmove.prevent
        @scroll.stop.prevent
      ></div>
    </transition>

    <transition name="fade">
      <div
        class="close-btn w-24 h-24 p-fixed rt-8 text-center transition cur-pointer z-102"
        @click="$emit('update:show', false)"
        v-if="show"
      >
        <i class="iconfont fs-16">&#xe685;</i>
      </div>
    </transition>

    <transition name="slide-up">
      <div
        class="content-area p-fixed w-100p lb-0 bg-white flex-column align-center b-box y-auto z-101"
        @click.stop
        v-if="show"
      >
        <transition name="slide-down">
          <div class="w-100p mw-1172 flex-column align-center" v-if="contentShow">
            <div class="w-100p mw-800 flex-row align-center space-between">
              <div>
                <div class="fs-16 lh-24 fw-bold">
                  {{ listData.find((item) => item.presentableId === currentId).presentableTitle }}
                </div>
                <div class="author lh-17 mt-6">{{ imageInfo?.username }}</div>
              </div>

              <div class="share-btn w-40 h-40 brs-8 text-center cur-pointer transition">
                <i class="iconfont fs-20">&#xe6b0;</i>
              </div>
            </div>

            <img
              class="w-100p mw-800 brs-8 mt-40"
              :src="imageInfo?.content"
              :alt="listData.find((item) => item.presentableId === currentId).presentableTitle"
            />

            <div class="w-100p mw-800 fs-20 lh-32 mt-56">{{ imageInfo?.intro }}</div>

            <div class="w-100p mw-800 mt-50 flex-row">
              <div
                class="tag ml-self-8 p-10 fs-12 brs-2 cur-pointer transition"
                v-for="tag in listData.find((item) => item.presentableId === currentId).tags"
                :key="tag"
              >
                {{ tag }}
              </div>
            </div>

            <template v-if="more.length">
              <div class="w-100p h-0 bb-1 my-80"></div>

              <div class="w-100p fs-16 fw-bold">more</div>

              <div class="more-images w-100p mt-16">
                <frame
                  :data="item"
                  v-for="item in more"
                  :key="item.presentableId"
                  @click="viewImage(item.presentableId)"
                />
              </div>
            </template>

            <div class="key-tip w-100p mw-400 flex-row space-between mt-66">
              <div class="flex-row align-center">
                <div class="key w-22 h-22 brs-4 text-center b-box">
                  <i class="iconfont fs-12">&#xe612;</i>
                </div>
                <span class="fs-12 ml-12">Previous shot</span>
                <div class="key w-22 h-22 brs-4 text-center b-box ml-25">
                  <i class="iconfont fs-12">&#xe602;</i>
                </div>
                <span class="fs-12 ml-12">Next shot</span>
              </div>
              <div class="flex-row align-center">
                <div class="key w-25 h-22 brs-4 text-center b-box">
                  <i class="iconfont fs-22">&#xe634;</i>
                </div>
                <span class="fs-12 ml-12">Close</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, reactive, SetupContext, toRefs, watch, watchEffect } from "vue";
import { getInfo } from "@/api/freelog";
import { ExhibitItem } from "@/utils/interface";

export default {
  name: "detail-popup",

  props: ["listData", "id", "show"],

  components: {
    frame: defineAsyncComponent(() => import("../components/frame.vue")),
  },

  setup(props: { listData: ExhibitItem[]; id: string; show: boolean }, context: SetupContext<Record<string, any>>) {
    const data = reactive({
      imageInfo: {} as Partial<ExhibitItem>,
      currentId: "",
      contentShow: true,
      more: computed(() => {
        const index = props.listData.findIndex((item) => item.presentableId === data.currentId);
        let moreImages = props.listData.slice(index + 1).filter((item, index) => index < 4);
        const { length } = moreImages;
        if (length !== 4) moreImages.push(...props.listData.slice(0, 4 - length));
        return moreImages;
      }),
    });

    const viewImage = (id: string) => {
      data.currentId = id;
    };

    const getImageInfo = async (id: string) => {
      const resourceInfo = await getInfo(id, "getResourceInfoById", [], () => {
        context.emit("update:show", false);
      });
      const { intro, username } = resourceInfo.data.data;
      const content: string = await getInfo(id, "getFileStreamById", [true]);
      data.imageInfo = { intro, username, content };
      setTimeout(() => {
        data.contentShow = true;
      }, 100);
    };

    const keyup = (e: KeyboardEvent) => {
      if (e.key === "Escape") context.emit("update:show", false);
      const currentIndex = props.listData.findIndex((item) => item.presentableId === data.currentId);
      if (e.key === "ArrowLeft" && currentIndex !== 0) data.currentId = props.listData[currentIndex - 1].presentableId;
      if (e.key === "ArrowRight" && currentIndex !== props.listData.length - 1)
        data.currentId = props.listData[currentIndex + 1].presentableId;
    };

    watchEffect(() => {
      if (props.show) {
        data.currentId = props.id;
        getImageInfo(data.currentId);
        window.addEventListener("keyup", keyup);
      } else {
        window.removeEventListener("keyup", keyup);
      }
    });

    return {
      ...toRefs(data),
      viewImage,
    };
  },
};
</script>

<style lang="scss" scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.8);
}

.close-btn {
  color: #dbdbde;

  &:hover {
    color: #fff;
  }
}

.content-area {
  padding: 64px 120px;
  border-radius: 12px 12px 0 0;
  height: calc(100vh - 40px);

  .author {
    color: #9e9ea7;
  }

  .share-btn {
    color: #0d0c22;
    box-shadow: 0px 0px 0px 1px #e7e7e9 inset;

    &:hover {
      box-shadow: 0px 0px 0px 1px #dbdbde inset;
    }
  }

  .tag {
    background-color: #f2f2f2;
    color: #6b6b6b;
    letter-spacing: 1px;

    &:hover {
      background-color: #dddddd;
    }
  }

  .more-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(204px, 1fr));
    grid-gap: 40px;
  }

  .key-tip {
    color: #6e6d7a;

    .key {
      border: 1px solid #ccc;
      box-shadow: 0 2px 0 #ccc;

      .iconfont {
        color: #ccc;
      }
    }
  }
}

@media (max-width: 1200px) {
  .more-images {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
  }
}

@media (max-width: 919px) {
  .close-btn {
    color: #3d3d4e;

    &:hover {
      color: #0d0c22;
    }
  }

  .content-area {
    padding: 32px 16px;
    border-radius: 0;
    height: 100vh;
  }
}
</style>
