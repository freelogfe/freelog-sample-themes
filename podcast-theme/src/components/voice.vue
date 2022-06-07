<!-- 声音 -->
<template>
  <div class="voice-wrapper">
    <!-- PC -->
    <div class="pc-voice-wrapper">
      <div
        ref="cover"
        class="cover-area"
        :class="{ 'opacity-40p': !data.authLinkNormal }"
        @click="$router.push({ path: '/voice-detail', query: { id: data.exhibitId } })"
      >
        <img class="cover" :src="data.coverImages[0]" />
        <div class="offline" v-if="data.onlineStatus === 0 && statusShow"><span>已下架</span></div>
        <div class="btn-modal">
          <div class="btn" @click.stop="playOrPause()">
            <i class="freelog" :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"></i>
          </div>
        </div>
      </div>
      <div class="info-area">
        <div class="title-area">
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="!data.authLinkNormal" />
          <img class="lock" src="../assets/images/mini-lock.png" @click.stop="getAuth()" v-if="data.authCode === 303" />
          <div
            class="tag is-auth"
            :class="{ 'opacity-40p': !data.authLinkNormal }"
            v-if="authShow && [200, 301].includes(data.authCode)"
          >
            已授权
          </div>
          <div
            class="tag not-auth"
            :class="{ 'opacity-40p': !data.authLinkNormal }"
            v-if="authShow && data.authCode === 303"
          >
            未授权
          </div>
          <my-tooltip class="title" :class="{ 'opacity-40p': !data.authLinkNormal }" :content="data.exhibitTitle">
            <span @click="$router.push({ path: '/voice-detail', query: { id: data.exhibitId } })">
              {{ data.exhibitTitle }}
            </span>
          </my-tooltip>
        </div>
        <my-tooltip
          class="intro"
          :class="{ 'opacity-40p': !data.authLinkNormal }"
          :content="data.versionInfo.exhibitProperty.intro"
        >
          <span>{{ data.versionInfo.exhibitProperty.intro }}</span>
        </my-tooltip>
        <div class="other-area" :class="{ 'opacity-40p': !data.authLinkNormal }">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ data.updateDate | relativeTime }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ data.signCount | signCount }}</div>
          </div>
          <transition name="slide-right">
            <div
              class="info-item"
              v-if="$store.state.playingInfo && $store.state.playingInfo.exhibitId === data.exhibitId"
            >
              <play-status :playing="playing" />
              <div class="progress" v-if="$store.state.duration">
                {{ $store.state.progress | secondsToHMS }}/{{ $store.state.duration | secondsToHMS }}
              </div>
            </div>
          </transition>
        </div>
      </div>
      <div class="btns-area" :class="{ opacity: !data.authLinkNormal }">
        <template v-for="item in btnList">
          <my-tooltip class="text-btn" :content="item.title" :key="item.title" v-if="!item.hidden">
            <i class="freelog" :class="item.icon" @click="item.operate" />
          </my-tooltip>
        </template>
      </div>
      <div class="duration">{{ $store.state.duration | duration }}</div>
      <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="data.coverImages[0]" />
      </div>
    </div>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";

export default {
  name: "voice",

  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    statusShow: {
      type: Boolean,
      default: false,
    },
    authShow: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    playStatus,
    myTooltip,
  },

  data() {
    return {
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
      isCollected: false,
      isInPlayList: false,
    };
  },

  watch: {
    "$store.state.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist(this.data.exhibitId);
      },
      immediate: true,
    },
    "$store.state.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist(this.data.exhibitId);
      },
      immediate: true,
    },
  },

  computed: {
    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.$store.state;
      return playing && playingInfo.exhibitId === this.data.exhibitId;
    },

    /** 操作按钮群 */
    btnList() {
      return [
        {
          icon: this.playing ? "fl-icon-zanting-daibiankuang" : "fl-icon-bofang-daibiankuang",
          title: this.playing ? "暂停" : "播放",
          operate: this.playOrPause,
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          title: "加入播放列表",
          operate: this.addToPlayList,
          hidden: this.isInPlayList,
        },
        {
          icon: this.isCollected ? "fl-icon-shoucangxiaoshuoyishoucang" : "fl-icon-shoucangxiaoshuo",
          title: this.isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect,
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: this.share },
      ];
    },
  },

  methods: {
    // 播放/暂停
    playOrPause() {
      useMyPlay.playOrPause(this.data);
    },

    // 加入播放列表
    addToPlayList() {
      useMyPlay.addToPlayList(this.data.exhibitId, () => {
        const { offsetTop, offsetLeft } = this.$refs.cover;
        this.coverLeft = offsetLeft;
        this.coverTop = offsetTop - app.scrollTop;
        this.addAnimation = true;
        setTimeout(() => {
          this.addAnimation = false;
        }, 700);
      });
    },

    // 收藏/取消收藏
    async operateCollect() {
      useMyCollection.operateCollect(this.data);
    },

    // 分享
    share() {
      this.$store.commit("setData", { key: "shareInfo", value: { show: true, exhibit: this.data } });
    },

    // 授权
    async getAuth() {
      useMyAuth.getAuth(this.data);
    },
  },
};
</script>

<style lang="scss" scoped>
.voice-wrapper {
  // pc
  .pc-voice-wrapper {
    display: flex;
    align-items: center;

    &:hover {
      .btns-area {
        opacity: 1;

        &.opacity {
          opacity: 0.4;
        }
      }
    }

    .cover-area {
      position: relative;
      width: 100px;
      height: 100px;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      transition: all 0.5s ease;
      z-index: 1;

      &:hover {
        opacity: 1;

        .btn-modal {
          background: rgba(0, 0, 0, 0.2);

          .btn {
            opacity: 1;
          }
        }
      }

      .cover {
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
        display: flex;
        align-items: center;
        justify-content: center;

        span {
          font-size: 10px;
          font-weight: 600;
          color: #ffffff;
          transform: scale(0.84);
        }
      }

      .btn-modal {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.5s ease;

        .btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(1px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.5s ease;

          &:hover {
            background: #2784ff;
          }

          &:active {
            background: rgba(255, 255, 255, 0.4);
          }

          .freelog {
            font-size: 18px;
            color: #fff;
          }
        }
      }
    }

    .info-area {
      width: 700px;
      height: 100%;
      margin-left: 20px;

      .title-area {
        width: 100%;
        display: flex;
        align-items: center;

        .auth-link-abnormal,
        .lock {
          width: 16px;
          height: 16px;
          margin-right: 10px;
        }

        .lock {
          cursor: pointer;
        }

        .tag {
          flex-shrink: 0;
          width: 56px;
          height: 22px;
          border-radius: 22px;
          margin-right: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;

          &.is-auth {
            background: #42c28c;
          }

          &.not-auth {
            background: #e9a923;
          }
        }

        .title {
          flex: 1;
          width: 0;
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          line-height: 22px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            color: #fff;
            text-decoration: underline;
            opacity: 1;
          }
        }
      }

      .intro {
        width: 100%;
        height: 40px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.4);
        line-height: 20px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-top: 10px;
      }

      .other-area {
        display: flex;
        margin-top: 10px;

        .info-item {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.4);

          & + .info-item {
            margin-left: 20px;
          }

          .freelog {
            font-size: 16px;
          }

          .item-value {
            font-size: 12px;
            line-height: 18px;
            margin-left: 5px;
          }

          .progress {
            font-size: 12px;
            color: #2784ff;
            line-height: 18px;
            margin-left: 10px;
          }
        }
      }
    }

    .btns-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.5s ease;

      .text-btn {
        .freelog {
          font-size: 20px;
        }

        & + .text-btn {
          margin-left: 24px;
        }
      }
    }

    .duration {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
      flex-shrink: 0;
    }

    .cover-to-add {
      position: fixed;
      width: 100px;
      height: 100px;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      z-index: -1;

      &.animation {
        z-index: 200;
        animation: to-play-list 0.7s ease-out forwards;
      }

      .cover {
        height: 100%;
      }

      @keyframes to-play-list {
        from {
          opacity: 1;
          transform: scale(1);
          right: calc(100vw - var(--left) - 100px);
          bottom: calc(100vh - var(--top) - 100px);
        }
        to {
          opacity: 0;
          transform: scale(0);
          right: 119px;
          bottom: -50px;
        }
      }
    }

    .opacity-40p {
      opacity: 0.4;
    }
  }
}
</style>
