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
        <!-- 普通图片 -->
        <img class="image" v-lazy="data.coverImages[0]" v-if="isAuth" />

        <!-- 下架标识 -->
        <div class="offline" v-if="data.onlineStatus === 0">已下架</div>

        <!-- 视频遮罩 -->
        <div class="video-modal" v-if="data.articleInfo.resourceType === 'video' && isAuth">
          <img class="video-image" src="../assets/images/video.png" />

          <div class="video-bar">
            <div class="auth-tag" :class="isAuth ? 'is-auth' : 'not-auth'" v-if="inSignedList">
              {{ isAuth ? "已授权" : "未授权" }}
            </div>
            <div class="sign-count">签约量 {{ getSignCount(data.signCount) }}</div>
          </div>
        </div>

        <!-- 毛玻璃图片（未授权） -->
        <div class="filter-modal" v-if="!isAuth">
          <div class="filter-modal-body">
            <div class="img-box">
              <img class="img" src="../assets/images/video.png" v-if="data.articleInfo.resourceType === 'video'" />
              <img class="img" src="../assets/images/lock.png" />
            </div>

            <div class="filter-bar">
              <div class="auth-tag" :class="isAuth ? 'is-auth' : 'not-auth'" v-if="inSignedList">
                {{ isAuth ? "已授权" : "未授权" }}
              </div>
              <div class="sign-count">签约量 {{ getSignCount(data.signCount) }}</div>
            </div>
          </div>
        </div>

        <!-- 默认状态签约量 -->
        <div class="normal-bar" v-if="isAuth && data.articleInfo.resourceType === 'image'">
          <div class="auth-tag" :class="isAuth ? 'is-auth' : 'not-auth'" v-if="inSignedList">
            {{ isAuth ? "已授权" : "未授权" }}
          </div>
          <div class="sign-count">签约量 {{ getSignCount(data.signCount) }}</div>
        </div>
      </div>

      <!-- 资源信息 -->
      <div class="frame-info">
        <div class="title">
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
      <!-- 普通图片 -->
      <img class="image" v-lazy="data.coverImages[0]" v-if="isAuth" />

      <!-- 下架标识 -->
      <div class="offline" v-if="data.onlineStatus === 0">已下架</div>

      <!-- 视频遮罩 -->
      <transition name="fade">
        <div class="video-modal" v-if="data.articleInfo.resourceType === 'video' && isAuth && !modalShow">
          <img class="video-image" src="../assets/images/video.png" />

          <div class="video-bar">
            <div class="auth-tag" :class="isAuth ? 'is-auth' : 'not-auth'" v-if="inSignedList">
              {{ isAuth ? "已授权" : "未授权" }}
            </div>
            <div class="sign-count">签约量 {{ getSignCount(data.signCount) }}</div>
          </div>
        </div>
      </transition>

      <!-- 毛玻璃图片（未授权） -->
      <div class="filter-modal" v-if="!isAuth">
        <transition name="fade">
          <div class="filter-modal-body" v-show="!modalShow">
            <div class="img-box">
              <img class="img" src="../assets/images/video.png" v-if="data.articleInfo.resourceType === 'video'" />
              <img class="img" src="../assets/images/lock.png" />
            </div>

            <div class="filter-bar">
              <div class="auth-tag" :class="isAuth ? 'is-auth' : 'not-auth'" v-if="inSignedList">
                {{ isAuth ? "已授权" : "未授权" }}
              </div>
              <div class="sign-count">签约量 {{ getSignCount(data.signCount) }}</div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 默认状态签约量 -->
      <transition name="fade">
        <div class="normal-bar" v-if="isAuth && data.articleInfo.resourceType === 'image' && !modalShow">
          <div class="auth-tag" :class="isAuth ? 'is-auth' : 'not-auth'" v-if="inSignedList">
            {{ isAuth ? "已授权" : "未授权" }}
          </div>
          <div class="sign-count">签约量 {{ getSignCount(data.signCount) }}</div>
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
            <img class="img" src="../assets/images/lock.png" @click.stop="getAuth(data.exhibitId)" v-if="!isAuth" />
          </div>
          <div class="title">
            {{ data.exhibitTitle }}
          </div>
          <tags :tags="data.tags" v-if="data.tags.length" />
          <div class="footer-info">
            <div class="author-info">
              <img class="avatar" :src="getAvatarUrl(data.userId)" />
              <div class="author-name" :title="data.articleInfo.articleOwnerName">
                {{ data.articleInfo.articleOwnerName }}
              </div>
            </div>
            <div class="sign-count-text">签约量 {{ getSignCount(data.signCount) }}</div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from "@vue/reactivity";
import { defineAsyncComponent } from "vue";
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
      isAuth: props.data.isAuth || false,
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
      getSignCount,
      ...toRefs(store.state),
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
  border-radius: 10px;
  overflow: hidden;

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
          width: 48px;
          height: 48px;
        }

        .video-bar {
          margin-top: 15px;
          display: flex;
        }
      }

      .filter-modal {
        position: relative;
        width: 100%;
        height: var(--height);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        overflow: hidden;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          top: 0;
          filter: blur(10px);
          background-image: var(--url);
          background-size: cover;
        }

        .filter-modal-body {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          top: 0;
          background-color: rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .img-box {
            display: flex;

            .img {
              width: 48px;
              height: 48px;

              & + .img {
                margin-left: 10px;
              }
            }
          }

          .filter-bar {
            margin-top: 15px;
            display: flex;
          }
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

      .video-bar {
        display: flex;
        margin-top: 30px;
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
        inset: 0;
        filter: blur(10px);
        background-image: var(--url);
        background-size: cover;
      }

      .filter-modal-body {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .img-box {
          display: flex;

          .img {
            width: 64px;
            height: 64px;

            & + .img {
              margin-left: 20px;
            }
          }
        }

        .filter-bar {
          margin-top: 30px;
          display: flex;
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
    justify-content: center;
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
}
</style>
