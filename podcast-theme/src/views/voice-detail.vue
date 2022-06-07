<template>
  <div class="voice-detail-wrapper">
    <!-- PC -->
    <div class="pc-voice-detail-wrapper" v-if="voiceInfo">
      <div ref="cover" class="cover-area">
        <img class="cover" :src="voiceInfo.coverImages[0]" />
      </div>

      <div class="right-area">
        <div class="title-area">
          <img
            class="auth-link-abnormal"
            src="../assets/images/auth-link-abnormal.png"
            v-if="!voiceInfo.authLinkNormal"
          />
          <img
            class="lock"
            src="../assets/images/mini-lock.png"
            @click.stop="getAuth()"
            v-if="voiceInfo.authCode === 303"
          />

          <div class="type-mark">声音</div>

          <my-tooltip class="title" :content="voiceInfo.exhibitTitle">
            <span>{{ voiceInfo.exhibitTitle }}</span>
          </my-tooltip>
        </div>
        <div class="intro">{{ voiceInfo.versionInfo.exhibitProperty.intro }}</div>
        <div class="info-area">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ voiceInfo.updateDate | relativeTime }}</div>
          </div>
          <div class="info-item">
            <i class="freelog fl-icon-yonghu"></i>
            <div class="item-value">{{ voiceInfo.signCount | signCount }}</div>
          </div>
        </div>

        <div class="btns-area">
          <template v-if="$store.state.playingInfo">
            <div class="duration" v-if="$store.state.playingInfo.exhibitId !== voiceInfo.exhibitId">
              时长{{ $store.state.duration | duration }}
            </div>
            <transition name="slide-right">
              <div class="playing-mark" v-if="$store.state.playingInfo.exhibitId === voiceInfo.exhibitId">
                <play-status :playing="$store.state.playing" />
                <div class="progress" v-if="$store.state.duration">
                  {{ $store.state.progress | secondsToHMS }}/{{ $store.state.duration | secondsToHMS }}
                </div>
              </div>
            </transition>
          </template>
          <template v-for="(item, index) in btnList">
            <div
              class="btn"
              :class="index === 0 ? 'play-btn' : 'normal-btn'"
              :key="item.title"
              @click="item.operate"
              v-if="!item.hidden"
            >
              <i class="freelog" :class="item.icon"></i>
              <div class="btn-label">{{ item.title }}</div>
            </div>
          </template>
        </div>
      </div>

      <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="voiceInfo.coverImages[0]" />
      </div>
    </div>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";
import { getExhibitInfo, getExhibitSignCount, getExhibitAuthStatus, getExhibitAvailable } from "@/api/freelog";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";

export default {
  name: "voice-detail",

  components: { playStatus, myTooltip },

  data() {
    return {
      id: this.$route.query.id,
      voiceInfo: null,
      isCollected: false,
      isInPlayList: false,
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
    };
  },

  watch: {
    "$store.state.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist(this.id);
      },
      immediate: true,
    },
    "$store.state.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist(this.id);
      },
      immediate: true,
    },
    "$store.state.authIdList"(cur) {
      if (cur.includes(this.voiceInfo.exhibitId)) this.voiceInfo.authCode = 200;
    },
  },

  computed: {
    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.$store.state;
      return playing && playingInfo.exhibitId === this.voiceInfo.exhibitId;
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

  created() {
    this.getVoiceInfo();
  },

  methods: {
    // 播放/暂停
    playOrPause() {
      useMyPlay.playOrPause(this.voiceInfo);
    },

    // 加入播放列表
    addToPlayList() {
      useMyPlay.addToPlayList(this.id, () => {
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
    operateCollect() {
      useMyCollection.operateCollect(this.voiceInfo);
    },

    // 分享
    share() {
      this.$store.commit("setData", { key: "shareInfo", value: { show: true, exhibit: this.voiceInfo } });
    },

    /** 获取声音详情 */
    async getVoiceInfo() {
      const [exhibitInfo, signCountData, statusInfo, authLinkStatusInfo] = await Promise.all([
        getExhibitInfo(this.id, { isLoadVersionProperty: 1 }),
        getExhibitSignCount(this.id),
        getExhibitAuthStatus(this.id),
        getExhibitAvailable(this.id),
      ]);
      this.voiceInfo = {
        ...exhibitInfo.data.data,
        signCount: signCountData.data.data[0].count,
        authCode: statusInfo.data.data[0].authCode,
        authLinkNormal: statusInfo.data.data[0].authCode === 301 ? false : authLinkStatusInfo.data.data[0].isAuth,
      };
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.voiceInfo);
    },
  },
};
</script>

<style lang="scss" scoped>
.voice-detail-wrapper {
  .pc-voice-detail-wrapper {
    padding-top: 20px;
    padding-bottom: 168px;
    display: flex;

    .cover-area {
      position: relative;
      width: 210px;
      height: 210px;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;

      .cover {
        height: 100%;
      }
    }

    .right-area {
      flex: 1;
      width: 0;
      margin-left: 50px;

      .title-area {
        display: flex;
        align-items: center;

        .auth-link-abnormal,
        .lock {
          width: 30px;
          height: 30px;
          margin-right: 20px;
        }

        .lock {
          cursor: pointer;
        }

        .type-mark {
          padding: 6px 15px;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          line-height: 20px;
        }

        .title {
          flex: 1;
          width: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 36px;
          font-weight: 600;
          color: #ffffff;
          line-height: 56px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-left: 20px;
        }
      }

      .intro {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.4);
        line-height: 20px;
        word-break: break-all;
        margin-top: 20px;
      }

      .info-area {
        display: flex;
        margin-top: 20px;

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
        }
      }

      .btns-area {
        margin-top: 30px;
        display: flex;
        align-items: center;

        .duration {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
          line-height: 20px;
          margin-right: 20px;
        }

        .playing-mark {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.4);
          margin-right: 20px;

          .progress {
            font-size: 12px;
            color: #2784ff;
            line-height: 18px;
            margin-left: 10px;
          }
        }

        .btn {
          padding: 0 20px;
          height: 38px;
          border-radius: 38px;
          display: flex;
          align-items: center;

          & + .btn {
            margin-left: 15px;
          }

          .freelog {
            font-size: 16px;
          }

          .btn-label {
            font-size: 14px;
            font-weight: 600;
            margin-left: 5px;
          }
        }
      }
    }

    .cover-to-add {
      position: fixed;
      width: 210px;
      height: 210px;
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
          right: calc(100vw - var(--left) - 210px);
          bottom: calc(100vh - var(--top) - 210px);
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
