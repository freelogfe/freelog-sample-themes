<template>
  <div
    class="frame-wrapper"
    :class="{
      'in-pc': !inMobile,
    }"
    :style="{
      '--height': data.height + 'px',
      '--url': 'url(' + data.coverImages[0] + ')',
    }"
  >
    <!-- mobile -->
    <div
      class="mobile-frame-wrapper"
      :class="{
        'min-size': data.height === 120,
      }"
      v-if="inMobile"
    >
      <div class="cover-box">
        <img class="image" :style="{ opacity: authLinkAbnormal ? 0.4 : 1 }" v-lazy="data.coverImages[0]" />

        <!-- 下架标识 -->
        <div class="offline" v-if="data.onlineStatus === 0">已下架</div>

        <!-- 视频遮罩 -->
        <div class="video-modal" v-if="data.articleInfo.resourceType === 'video'">
          <img class="video-image" src="../assets/images/video.png" />
        </div>

        <!-- 签约量 -->
        <div class="normal-bar">
          <div class="lock-circle" v-if="!isAuth">
            <img class="lock" src="../assets/images/mini-lock.png" />
          </div>
          <div class="auth-tag" :class="isAuth ? 'is-auth' : 'not-auth'" v-if="inSignedList">
            {{ isAuth ? "已授权" : "未授权" }}
          </div>
          <div class="sign-count">签约量：{{ getSignCount(data.signCount) }}</div>
        </div>
      </div>

      <!-- 资源信息 -->
      <div class="frame-info">
        <div class="title">
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="authLinkAbnormal" />
          {{ data.exhibitTitle }}
        </div>
        <tags :tags="data.tags" v-if="data.tags.length" />
        <div class="author-info">
          <img class="avatar" :src="getAvatarUrl(data.articleInfo.articleOwnerId)" />
          {{ data.articleInfo.articleOwnerName }}
        </div>
      </div>
    </div>

    <!-- PC -->
    <div
      class="pc-frame-wrapper"
      :class="{
        'min-size': data.height === 230,
      }"
      @mouseover="modalShow = true"
      @mouseleave="modalShow = false"
      v-if="!inMobile"
    >
      <img class="image" :style="{ opacity: authLinkAbnormal ? 0.4 : 1 }" v-lazy="data.coverImages[0]" />

      <!-- 下架标识 -->
      <div class="offline" v-if="data.onlineStatus === 0">已下架</div>

      <!-- 视频遮罩 -->
      <transition name="fade">
        <div class="video-modal" v-if="data.articleInfo.resourceType === 'video' && !modalShow">
          <img class="video-image" src="../assets/images/video.png" />
        </div>
      </transition>

      <!-- 签约量 -->
      <transition name="fade">
        <div class="normal-bar" v-if="!modalShow">
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="authLinkAbnormal" />
          <div class="lock-circle" v-if="!isAuth">
            <img class="lock" src="../assets/images/mini-lock.png" />
          </div>
          <div class="auth-tag" :class="isAuth ? 'is-auth' : 'not-auth'" v-if="inSignedList">
            {{ isAuth ? "已授权" : "未授权" }}
          </div>
          <div class="sign-count">签约量：{{ getSignCount(data.signCount) }}</div>
        </div>
      </transition>

      <!-- 信息层 -->
      <transition name="fade">
        <div class="modal" v-if="modalShow"></div>
      </transition>
      <transition name="slide-up">
        <div class="modal-content" v-if="modalShow">
          <div class="img-box">
            <img class="img" src="../assets/images/video.png" v-if="data.articleInfo.resourceType === 'video'" />
          </div>
          <div class="title">
            <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="authLinkAbnormal" />
            <img
              class="lock"
              src="../assets/images/mini-lock.png"
              @click.stop="getAuth(data.exhibitId)"
              v-if="!isAuth"
            />
            <span>{{ data.exhibitTitle }}</span>
          </div>
          <tags :tags="data.tags" v-if="data.tags.length" />
          <div class="footer-info">
            <div class="author-info">
              <img class="avatar" :src="getAvatarUrl(data.userId)" />
              <div class="author-name" :title="data.articleInfo.articleOwnerName">
                {{ data.articleInfo.articleOwnerName }}
              </div>
            </div>
            <div class="sign-count-text">签约量：{{ getSignCount(data.signCount) }}</div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from "@vue/reactivity";
import { defineAsyncComponent, watch } from "vue";
import { addAuth } from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { useStore } from "vuex";
import { getSignCount } from "@/utils/common";

export default {
  name: "frame",

  props: ["data", "inSignedList"],

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
  },

  setup(props: { data: ExhibitItem }) {
    const store = useStore();
    const data = reactive({
      modalShow: false,
      defaulterIdentityType: props.data.defaulterIdentityType,
    });
    /** 是否授权 */
    const isAuth = computed(() => data.defaulterIdentityType < 4);
    /** 授权链异常 */
    const authLinkAbnormal = computed(() => ![0, 4].includes(data.defaulterIdentityType));

    const methods = {
      // 获取头像
      getAvatarUrl(id: any) {
        return `https://image.freelog.com/headImage/${id}`;
      },

      // 授权
      async getAuth(id: string) {
        const authResult = await addAuth(id);
        const { status } = authResult;
        if (status === 0) data.defaulterIdentityType = 0;
      },
    };

    watch(
      () => props.data.defaulterIdentityType,
      (cur) => {
        data.defaulterIdentityType = cur;
      }
    );

    return {
      getSignCount,
      ...toRefs(store.state),
      ...toRefs(data),
      isAuth,
      authLinkAbnormal,
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.frame-wrapper {
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  z-index: 0;

  &.in-pc {
    cursor: pointer;
    transition: all 0.2s linear;

    &:hover {
      box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.3);
    }
  }

  // mobile
  .mobile-frame-wrapper {
    width: 100%;
    background-color: #fff;

    &.min-size {
      display: flex;
      flex-direction: column;
      align-items: center;

      .image {
        width: auto;
        height: 120px;
      }
    }

    .cover-box {
      position: relative;
      width: 100%;
      height: var(--height);
      border-radius: 10px;
      overflow: hidden;

      .image {
        width: 100%;
      }

      .offline {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 0px 0px 4px 0px;
        font-size: 10px;
        font-weight: 600;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      }

      .video-modal {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background: rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .video-image {
          position: sticky;
          bottom: 54px;
          width: 48px;
          height: 48px;
        }
      }
    }

    .frame-info {
      width: 100%;
      padding: 10px 0;

      .title {
        width: 100%;
        font-size: 16px;
        line-height: 22px;
        font-weight: bold;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        word-break: break-all;

        .auth-link-abnormal {
          width: 16px;
          height: 16px;
          margin-bottom: -2px;
          margin-right: 5px;
          display: inline-block;
        }
      }

      .tags-wrapper {
        margin-top: 10px;
        height: 24px;
        overflow: hidden;
      }

      .author-info {
        font-size: 12px;
        line-height: 18px;
        margin-top: 12px;
        display: flex;
        align-items: center;
        color: #999;

        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 5px;
          border: 1px solid #ebecf0;
        }
      }
    }
  }

  // PC
  .pc-frame-wrapper {
    position: relative;
    width: 100%;
    height: var(--height);
    background-color: #fff;

    &.min-size {
      display: flex;
      justify-content: center;

      .image {
        width: auto;
        height: 100%;
      }
    }

    .image {
      width: 100%;
    }

    .offline {
      position: absolute;
      left: 0;
      top: 0;
      width: 40px;
      height: 20px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 0px 0px 4px 0px;
      font-size: 10px;
      font-weight: 600;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .video-modal {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .video-image {
        width: 64px;
        height: 64px;
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
        word-break: break-all;

        .auth-link-abnormal {
          width: 16px;
          height: 16px;
          margin-right: 5px;
          display: inline-block;
          margin-bottom: -2px;
        }

        .lock {
          width: 14px;
          height: 14px;
          margin-right: 5px;
          display: inline-block;
          margin-bottom: -1px;
        }
      }

      .tags-wrapper {
        margin-top: 10px;
        height: 24px;
        overflow: hidden;
      }

      .footer-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;

        .author-info {
          display: flex;
          align-items: center;

          .avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
          }

          .author-name {
            width: 130px;
            font-size: 14px;
            line-height: 20px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-left: 10px;
          }
        }

        .sign-count-text {
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
        }
      }
    }
  }

  .normal-bar {
    position: absolute;
    bottom: 15px;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .auth-link-abnormal {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }

    .lock-circle {
      width: 24px;
      height: 24px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(6px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 5px;

      .lock {
        width: 12px;
        height: 12px;
      }
    }
  }
}

.auth-tag {
  flex-shrink: 0;
  width: 56px;
  height: 24px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;

  &.is-auth {
    background: #42c28c;
  }

  &.not-auth {
    background: #e9a923;
  }
}

.sign-count {
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.2);
  height: 24px;
  line-height: 24px;
  border-radius: 24px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  backdrop-filter: blur(6px);
}
</style>
