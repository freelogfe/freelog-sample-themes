<template>
  <div
    class="frame-wrapper"
    :style="{ height: data.height + 'px' }"
    @mouseover="modalShow = true"
    @mouseleave="modalShow = false"
  >
    <!-- 普通图片 -->
    <img class="image" v-lazy="data.coverImages[0]" v-if="isAuth" />

    <!-- 视频遮罩 -->
    <transition name="fade">
      <div
        class="video-modal"
        v-if="data.articleInfo.resourceType === 'video' && !modalShow"
      >
        <img class="video-image" src="../assets/images/video.png" />
      </div>
    </transition>

    <!-- 毛玻璃图片（未授权） -->
    <div
      class="filter-modal"
      :style="{ '--url': 'url(' + data.coverImages[0] + ')' }"
      v-if="!isAuth"
    >
      <transition name="fade">
        <div class="img-box" v-show="!modalShow">
          <img
            class="img"
            src="../assets/images/video.png"
            v-if="data.articleInfo.resourceType === 'video'"
          />
          <img class="img" src="../assets/images/lock.png" />
        </div>
      </transition>
    </div>

    <transition name="fade">
      <div class="modal" v-if="modalShow"></div>
    </transition>

    <transition name="slide-up">
      <div class="modal-content" v-if="modalShow">
        <div class="img-box">
          <img
            class="img"
            src="../assets/images/video.png"
            v-if="data.articleInfo.resourceType === 'video'"
          />
          <img
            class="img"
            src="../assets/images/lock.png"
            @click.stop="getAuth(data.exhibitId)"
            v-if="!isAuth"
          />
        </div>
        <div class="title">{{ data.exhibitName }}</div>
        <tags :tags="data.tags" v-if="data.tags.length" />
        <div class="author-info">
          <img class="avatar" :src="getAvatarUrl(data.userId)" />
          {{ data.articleInfo.articleOwnerName }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from "@vue/reactivity";
import { defineAsyncComponent } from "vue";
import { addAuth } from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";

export default {
  name: "frame",

  props: ["data"],

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
  },

  setup(props: { data: ExhibitItem }) {
    const data = reactive({
      modalShow: false,
      isAuth: props.data.isAuth,
    });

    const methods = {
      // 获取头像
      getAvatarUrl(id: any) {
        return `https://image.freelog.com/headImage/${id}`;
      },

      // 授权
      async getAuth(id: string) {
        const authResult = await addAuth(id);
        const { status } = authResult;
        if (status === 0) data.isAuth = true;
      },
    };

    return {
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.frame-wrapper {
  position: relative;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.3);
  }

  .image {
    width: 100%;
  }

  .video-modal {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    .video-image {
      width: 64px;
      height: 64px;
    }
  }

  .filter-modal {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      filter: blur(10px);
      background-image: var(--url);
      background-size: cover;
    }

    .img-box {
      display: flex;
      z-index: 1;

      .img {
        width: 64px;
        height: 64px;

        & + .img {
          margin-left: 20px;
        }
      }
    }
  }

  .modal {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  .modal-content {
    position: absolute;
    inset: 0;
    padding: 15px;
    box-sizing: border-box;
    color: #fff;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .img-box {
      display: flex;
      margin-bottom: 20px;

      .img {
        width: 34px;
        height: 34px;

        & + .img {
          margin-left: 10px;
        }
      }
    }

    .title {
      font-size: 16px;
      line-height: 22px;
    }

    .tags-wrapper {
      margin-top: 10px;
    }

    .author-info {
      font-size: 14px;
      line-height: 20px;
      margin-top: 20px;
      display: flex;
      align-items: center;

      .avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
  }
}
</style>
