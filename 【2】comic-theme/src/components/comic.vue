<!-- 漫画组件 -->

<template>
  <!-- 移动端收藏漫画组件 -->
  <div class="mobile-shelf-comic-wrapper" @click="toPath('/detail')" v-if="mode === 4">
    <div class="comic-cover-box">
      <img
        class="comic-cover"
        :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
        :src="data.coverImages[0]"
        :alt="data.exhibitTitle"
      />
      <div class="offline" v-if="data.articleInfo?.status !== 2 && data.onlineStatus === 0">
        已下架
      </div>
    </div>

    <div class="comic-name" :title="data.exhibitTitle">
      <img
        class="freeze-lock"
        src="../assets/images/freeze.png"
        v-if="data.articleInfo?.status === 2"
        alt="封禁"
      />
      <img
        class="auth-link-abnormal"
        src="../assets/images/auth-link-abnormal.png"
        v-else-if="![0, 4].includes(data.defaulterIdentityType)"
      />
      <div class="name" :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }">
        {{ data.exhibitTitle }}
      </div>
    </div>

    <div
      class="comic-author"
      :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
    >
      {{ data.articleInfo.articleOwnerName }}
    </div>
  </div>

  <!-- 普通漫画组件 -->
  <div
    class="comic-wrapper"
    :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }"
    @click="toPath('/detail')"
    v-if="mode !== 4"
  >
    <div class="comic-content">
      <div class="comic-cover-box">
        <img
          class="comic-cover"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          :src="data.coverImages[0]"
          :alt="data.exhibitTitle"
        />
        <div class="offline" v-if="data.articleInfo?.status !== 2 && data.onlineStatus === 0">
          已下架
        </div>
      </div>

      <div class="comic-info" :class="{ 'auth-comic': mode === 3 && inMobile }">
        <div class="comic-name-box" :title="data.exhibitTitle">
          <img
            class="freeze-lock"
            src="../assets/images/freeze.png"
            v-if="data.articleInfo?.status === 2"
            alt="封禁"
          />
          <img
            class="auth-link-abnormal"
            src="../assets/images/auth-link-abnormal.png"
            v-else-if="![0, 4].includes(data.defaulterIdentityType)"
            alt="授权链异常"
          />
          <img
            class="lock"
            src="../assets/images/mini-lock.png"
            alt="未授权"
            v-if="mode !== 3 && data.defaulterIdentityType >= 4"
          />
          <div
            class="comic-status"
            :class="
              data.articleInfo?.articleType === 1
                ? 'single-episode'
                : data.articleInfo.serializeStatus === 0
                ? 'on-going'
                : 'completed'
            "
          />
          <div
            class="comic-name"
            :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          >
            {{ data.exhibitTitle }}
          </div>
          <div class="tag is-auth" v-if="mode === 3 && data.defaulterIdentityType < 4 && !inMobile">
            已授权
          </div>
          <div
            class="tag not-auth"
            v-if="mode === 3 && data.defaulterIdentityType >= 4 && !inMobile"
          >
            未授权
          </div>
        </div>

        <div
          class="comic-author"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
        >
          {{ data.articleInfo.articleOwnerName }}
        </div>

        <div
          class="tags"
          :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
          v-if="!(mode === 3 && inMobile)"
        >
          <tags :tags="data.tags" />
        </div>

        <div
          class="auth-tag"
          :class="data.defaulterIdentityType < 4 ? 'is-auth' : 'not-auth'"
          v-if="mode === 3 && inMobile"
        >
          <span v-if="data.defaulterIdentityType < 4">已授权</span>
          <span v-else>未授权</span>
        </div>
      </div>

      <i
        class="freelog fl-icon-zhankaigengduo"
        :class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
        v-if="!(mode === 3 && inMobile)"
      ></i>

      <div
        class="main-btn btn"
        :class="{
          disabled:
            data.articleInfo?.status === 2 ||
            data.onlineStatus === 0 ||
            ![0, 4].includes(data.defaulterIdentityType) ||
            !['漫画'].includes(data.articleInfo?.resourceType[0])
        }"
        @click.stop="toPath('/detail')"
        v-if="[2, 3].includes(mode)"
      >
        立即阅读
      </div>

      <div class="warning-btn btn last-btn" @click.stop="deleteCollection()" v-if="mode === 2">
        取消收藏
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, toRefs } from "vue";
import { useStore } from "vuex";
import { showToast, formatDate } from "@/utils/common";
import { useMyRouter } from "@/utils/hooks";
import { ExhibitItem } from "@/api/interface";
import { State } from "@/store/index";

export default {
  name: "comic",

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue"))
  },

  // mode: 1-默认首页 2-收藏 3-签约记录 4-移动端首页收藏
  props: ["mode", "data", "operateShelf"],

  setup(props: { data: ExhibitItem; operateShelf: (data: ExhibitItem) => void }) {
    const store = useStore<State>();
    const { switchPage } = useMyRouter();
    let deleting = false;

    const methods = {
      /** 跳转页面 */
      toPath(path: string) {
        const { exhibitId, defaulterIdentityType = -1 } = props.data;

        if ((props.data.articleInfo as any)?.status === 2) {
          showToast("此作品因违规无法访问");
          return;
        }

        if (props.data.onlineStatus === 0) {
          showToast("作品已下架，无法访问");
          return;
        }

        if (![0, 4].includes(props.data.defaulterIdentityType!)) {
          showToast("作品异常，无法访问");
          return;
        }

        if (!["漫画"].includes(props.data?.articleInfo.resourceType[0])) {
          showToast("此作品格式暂不支持访问");
          return;
        }

        switchPage(path, { id: exhibitId });
      },

      /** 取消收藏 */
      deleteCollection() {
        if (!deleting) {
          deleting = true;
          const { data, operateShelf } = props;
          operateShelf(data);
        }
      }
    };

    return {
      ...toRefs(store.state),
      ...methods,
      formatDate
    };
  }
};
</script>

<style lang="scss" scoped>
// 移动端书架小说组件
.mobile-shelf-comic-wrapper {
  width: 100px;

  .comic-cover-box {
    position: relative;
    width: 100px;
    height: 140px;
    border-radius: 4px;
    background: #b7b7b7;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .comic-cover {
      height: 100%;
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
    }
  }

  .comic-name {
    width: 100px;
    font-size: 16px;
    font-weight: 600;
    color: #222222;
    line-height: 22px;
    margin-top: 10px;
    display: flex;
    align-items: center;

    .freeze-lock,
    .auth-link-abnormal {
      width: 16px;
      height: 16px;
      margin-right: 5px;
    }

    .name {
      flex: 1;
      width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .comic-author {
    width: 100px;
    font-size: 13px;
    color: #666666;
    line-height: 18px;
    margin-top: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

// 普通小说组件
.comic-wrapper {
  width: 100%;
  box-sizing: border-box;

  .comic-content {
    width: 100%;
    display: flex;
    align-items: center;

    .comic-cover-box {
      position: relative;
      border-radius: 4px;
      background: #b7b7b7;
      box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      .comic-cover {
        height: 100%;
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
      }
    }

    .comic-info {
      flex: 1;
      width: 0;
      margin-right: 20px;

      &.auth-comic {
        margin-right: 0;
      }

      .comic-name-box {
        width: 100%;
        display: flex;
        align-items: center;

        .freeze-lock,
        .auth-link-abnormal {
          width: 16px;
          height: 16px;
          margin-right: 5px;
        }

        .lock {
          width: 16px;
          height: 16px;
          margin-right: 10px;
        }

        .comic-status {
          width: 40px;
          height: 18px;
          margin-right: 5px;
          background-repeat: no-repeat;
          // background-size: 100% 100%;
          background-size: contain;

          &.on-going {
            background-image: url("../assets/images/status/on-going.png");
          }

          &.completed {
            background-image: url("../assets/images/status/completed.png");
          }

          &.single-episode {
            width: 30px;
            height: 18px;
            background-image: url("../assets/images/status/single-episode.png");
          }
        }

        .comic-name {
          font-size: 16px;
          color: #222;
          line-height: 22px;
          font-weight: bold;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .tag {
          flex-shrink: 0;
          width: 56px;
          height: 22px;
          border-radius: 22px;
          margin-left: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .is-auth {
          background: #42c28c;
        }

        .not-auth {
          background: #e9a923;
        }
      }

      .comic-author {
        width: 100%;
        font-size: 13px;
        line-height: 18px;
        color: #666666;
        margin-top: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .tags {
        margin-top: 12px;
        height: 24px;
        overflow: hidden;
      }
    }
  }

  // 移动端普通小说组件
  &.in-mobile {
    padding: 0 20px;

    &:active {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .comic-content {
      width: 100%;
      padding: 15px 0;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);

      .comic-cover-box {
        width: 70px;
        height: 98px;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
        margin-right: 15px;
      }

      .fl-icon-zhankaigengduo {
        width: 6px;
        height: 12px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        margin-left: 20px;
      }

      .btn {
        display: none;
      }

      .tag + .tag {
        margin-left: 8px;
      }

      .auth-tag {
        flex-shrink: 0;
        width: 56px;
        height: 22px;
        border-radius: 22px;
        font-size: 12px;
        font-weight: 600;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 18px;
      }

      .is-auth {
        background: #42c28c;
      }

      .not-auth {
        background: #e9a923;
      }
    }
  }

  // PC端普通小说组件
  &.in-pc {
    border-radius: 6px;
    padding: 10px;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0.1) 100%);
    cursor: pointer;

    &:hover {
      background: linear-gradient(90deg, rgba(0, 0, 0, 0.08) 0%, rgba(255, 255, 255, 0.1) 100%);
    }

    .comic-cover-box {
      width: 80px;
      height: 112px;
      margin-right: 20px;
    }

    .fl-icon-zhankaigengduo {
      display: none;
    }

    .btn {
      height: 38px;
      padding: 0 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;

      &.last-btn {
        margin-left: 15px;
      }

      &.assist-btn {
        margin-left: 15px;
      }

      &.disabled {
        opacity: 0.4;
      }
    }
  }
}

.opacity-40p {
  opacity: 0.4;
}
</style>
