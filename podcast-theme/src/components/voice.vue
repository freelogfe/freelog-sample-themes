<!-- 声音 -->
<template>
  <div class="voice-wrapper">
    <!-- mobile -->
    <div class="mobile-voice-wrapper" v-if="$store.state.inMobile">
      <div
        ref="cover"
        class="cover-area"
        :class="{ 'opacity-40': authLinkAbnormal }"
        @click="$router.myPush({ path: '/voice-detail', query: { id: data.exhibitId } })"
      >
        <img class="cover" v-view-lazy="data.coverImages[0]" />
        <div class="offline" v-if="data.onlineStatus === 0 && statusShow"><span>已下架</span></div>
      </div>
      <div class="info-area" @click="$router.myPush({ path: '/voice-detail', query: { id: data.exhibitId } })">
        <div class="title-area">
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="authLinkAbnormal" />
          <i class="freelog fl-icon-suoding lock" @click.stop="getAuth()" v-if="data.defaulterIdentityType >= 4"></i>
          <template v-if="authShow">
            <div class="tag is-auth" :class="{ 'opacity-40': authLinkAbnormal }" v-if="data.defaulterIdentityType < 4">
              已授权
            </div>
            <div class="tag not-auth" :class="{ 'opacity-40': authLinkAbnormal }" v-else>未授权</div>
          </template>
          <div class="title" :class="{ 'opacity-40': authLinkAbnormal }">
            {{ data.exhibitTitle }}
          </div>
        </div>
        <div class="duration-album" :class="{ 'opacity-40': authLinkAbnormal }">
          <div>{{ "153" | duration }}</div>
          <!-- <div class="album">{{ "专辑名称专辑名称专辑名称专辑名称专辑名称" }}</div> -->
        </div>
        <div class="other-area" :class="{ 'opacity-40': authLinkAbnormal }">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ data.updateDate | relativeTime }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ data.signCount | signCount }}</div>
          </div>
        </div>
      </div>
      <div class="btns-area" :class="{ opacity: authLinkAbnormal }">
        <i
          class="freelog"
          :class="playing ? 'fl-icon-zanting-daibiankuang' : 'fl-icon-bofang-daibiankuang'"
          @click="playOrPause()"
        />
        <i class="freelog fl-icon-xiaoshuomulu" @click="moreMenuShow = true" />
      </div>
      <div class="cover-to-add" :class="{ animation: addAnimation }" :style="{ '--top': coverTop + 'px' }">
        <img class="cover" :src="data.coverImages[0]" />
      </div>

      <!-- 更多菜单 -->
      <transition name="fade">
        <div class="modal" @click="moreMenuShow = false" v-if="moreMenuShow"></div>
      </transition>
      <transition name="slide-up-fade">
        <div class="more-menu-card" v-if="moreMenuShow">
          <div class="btns">
            <div
              class="btn"
              :class="{ disabled: item.disabled }"
              v-for="item in menuBtnList"
              :key="item.label"
              @click="item.operate"
            >
              <i class="freelog" :class="item.icon"></i>
              <div class="label">{{ item.label }}</div>
            </div>
          </div>
          <div class="close-btn" @click="moreMenuShow = false">关闭</div>
        </div>
      </transition>
    </div>

    <!-- PC -->
    <div class="pc-voice-wrapper" v-if="$store.state.inMobile === false">
      <div
        ref="cover"
        class="cover-area"
        :class="{ 'opacity-40': authLinkAbnormal }"
        @click="$router.myPush({ path: '/voice-detail', query: { id: data.exhibitId } })"
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
          <img class="auth-link-abnormal" src="../assets/images/auth-link-abnormal.png" v-if="authLinkAbnormal" />
          <i class="freelog fl-icon-suoding lock" @click.stop="getAuth()" v-if="data.defaulterIdentityType >= 4"></i>
          <template v-if="authShow">
            <div class="tag is-auth" :class="{ 'opacity-40': authLinkAbnormal }" v-if="data.defaulterIdentityType < 4">
              已授权
            </div>
            <div class="tag not-auth" :class="{ 'opacity-40': authLinkAbnormal }" v-else>未授权</div>
          </template>
          <my-tooltip class="title" :class="{ 'opacity-40': authLinkAbnormal }" :content="data.exhibitTitle">
            <span @click="$router.myPush({ path: '/voice-detail', query: { id: data.exhibitId } })">
              {{ data.exhibitTitle }}
            </span>
          </my-tooltip>
        </div>
        <div class="intro" :class="{ 'opacity-40': authLinkAbnormal }">
          {{ data.versionInfo.exhibitProperty.intro }}
        </div>
        <div class="other-area" :class="{ 'opacity-40': authLinkAbnormal }">
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
      <div class="btns-area" :class="{ opacity: authLinkAbnormal }">
        <my-tooltip
          class="text-btn"
          :class="{ disabled: item.disabled }"
          :content="item.title"
          v-for="item in btnList"
          :key="item.title"
        >
          <i class="freelog" :class="item.icon" @click="item.operate" />
        </my-tooltip>
      </div>
      <div class="duration">{{ 153 | duration }}</div>
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
    /** 声音信息 */
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    /** 是否显示上线状态 */
    statusShow: {
      type: Boolean,
      default: false,
    },
    /** 是否显示授权状态 */
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
      moreMenuShow: false,
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
    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.data.defaulterIdentityType);
    },

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
          disabled: this.isInPlayList,
        },
        {
          icon: this.isCollected ? "fl-icon-shoucangxiaoshuoyishoucang" : "fl-icon-shoucangxiaoshuo",
          title: this.isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect,
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: this.share },
      ];
    },

    /** 更多菜单按钮群 */
    menuBtnList() {
      return [
        {
          icon: this.playing ? "fl-icon-zanting-daibiankuang" : "fl-icon-bofang-daibiankuang",
          label: this.playing ? "暂停声音" : "播放声音",
          operate: this.playOrPause,
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          label: "加入播放列表",
          operate: this.addToPlayList,
          disabled: this.isInPlayList,
        },
        { icon: "fl-icon-danji", label: "查看声音详情", operate: this.toVoiceDetail },
        {
          icon: this.isCollected ? "fl-icon-shoucangxiaoshuoyishoucang" : "fl-icon-shoucangxiaoshuo",
          label: this.isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect,
        },
      ];
    },
  },

  methods: {
    /** 查看声音详情 */
    toVoiceDetail() {
      this.$router.myPush({ path: "/voice-detail", query: { id: this.data.exhibitId } });
    },

    /** 播放/暂停 */
    playOrPause() {
      useMyPlay.playOrPause(this.data);
    },

    /** 加入播放列表 */
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

    /** 收藏/取消收藏 */
    async operateCollect() {
      useMyCollection.operateCollect(this.data);
    },

    /** 分享 */
    share() {
      this.$store.commit("setData", { key: "shareInfo", value: { show: true, exhibit: this.data } });
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.data);
    },
  },
};
</script>

<style lang="scss" scoped>
.voice-wrapper {
  // mobile
  .mobile-voice-wrapper {
    display: flex;
    align-items: center;

    .cover-area {
      position: relative;
      width: 70px;
      height: 70px;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      z-index: 1;

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
    }

    .info-area {
      flex: 1;
      height: 100%;
      margin-left: 10px;

      .title-area {
        width: 100%;
        display: flex;
        align-items: center;

        .auth-link-abnormal {
          width: 16px;
          height: 16px;
          margin-right: 5px;
        }

        .lock {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          margin-right: 5px;
        }

        .tag {
          flex-shrink: 0;
          width: 49px;
          height: 20px;
          border-radius: 20px;
          margin-right: 5px;
          font-size: 11px;
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
          color: #fff;
          line-height: 22px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .duration-album {
        display: flex;
        font-size: 14px;
        line-height: 20px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 5px;

        .album {
          flex: 1;
          width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-left: 5px;
        }
      }

      .other-area {
        display: flex;
        margin-top: 5px;

        .info-item {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.4);

          & + .info-item {
            margin-left: 10px;
          }

          .freelog {
            font-size: 14px;
          }

          .item-value {
            font-size: 12px;
            line-height: 18px;
            margin-left: 5px;
          }
        }
      }
    }

    .btns-area {
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 20px;

      .freelog {
        font-size: 20px;

        & + .freelog {
          margin-left: 20px;
        }

        &:active {
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }

    .modal {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.2);
      z-index: 300;
    }

    .more-menu-card {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(20px);
      z-index: 300;

      .btns {
        width: 100%;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;

        .btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: rgba(255, 255, 255, 0.6);

          &:active {
            color: rgba(255, 255, 255, 0.4);

            .freelog {
              background: rgba(255, 255, 255, 0.03);
            }
          }

          &.disabled {
            background: rgba(255, 255, 255, 0.02);
            color: rgba(255, 255, 255, 0.24);
            pointer-events: none;
          }

          & + .btn {
            margin-left: 44px;
          }

          .freelog {
            width: 48px;
            height: 48px;
            font-size: 24px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .label {
            width: 48px;
            line-height: 17px;
            font-size: 12px;
            display: flex;
            justify-content: center;
            margin-top: 5px;
            word-break: keep-all;
          }
        }
      }

      .close-btn {
        width: 100%;
        height: 60px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);

        &:active {
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }

    .cover-to-add {
      position: fixed;
      width: 70px;
      height: 70px;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      opacity: 0;

      &.animation {
        z-index: 301;
        animation: to-play-list-mobile 0.7s ease-out forwards;
      }

      .cover {
        height: 100%;
      }

      @keyframes to-play-list-mobile {
        from {
          opacity: 1;
          transform: scale(1);
          right: calc(100vw - 85px);
          bottom: calc(100vh - var(--top) - 70px);
        }
        to {
          opacity: 0;
          transform: scale(0);
          right: -30px;
          bottom: -30px;
        }
      }
    }
  }

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
            margin-left: 5px;
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

        .auth-link-abnormal{
          width: 16px;
          height: 16px;
          margin-right: 5px;
        }

        .lock {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          margin-right: 5px;
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
            font-size: 14px;
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
        font-size: 20px;
        flex-shrink: 0;

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
      opacity: 0;

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
  }
}
</style>
