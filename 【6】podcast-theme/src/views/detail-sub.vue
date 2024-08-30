<!-- 子作品详情页 -->
<template>
  <div class="detail-wrapper">
    <transition name="detail-fade">
      <template v-if="voiceInfo">
        <div v-if="voiceInfo && voiceInfo.child && voiceInfo.child.authCode !== 403">
          <!-- mobile -->
          <div class="mobile-detail-wrapper" v-if="$store.state.inMobile">
            <div ref="cover" class="cover-area">
              <img class="cover" :src="voiceInfo.child.articleInfo.coverImages[0]" v-if="voiceInfo.child.articleInfo.coverImages[0]" />
              <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
            </div>
            <div class="title-area">
              <img
                class="auth-link-abnormal"
                src="../assets/images/auth-link-abnormal.png"
                v-if="authLinkAbnormal"
              />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth()"
                v-if="voiceInfo.defaulterIdentityType >= 4"
              ></i>
              <my-tooltip class="title" :content="voiceInfo.exhibitTitle">
                <span>{{ voiceInfo.child.itemTitle }}</span>
              </my-tooltip>
            </div>
            <div class="info-area">
              <div class="info-item">
                <i class="freelog fl-icon-gengxinshijian"></i>
                <div class="item-value">{{ voiceInfo.child.createDate | relativeTime }}</div>
              </div>
              <div class="info-item">
                <i class="freelog fl-icon-yonghu"></i>
                <div class="item-value">{{ voiceInfo.signCount | signCount }}</div>
              </div>
              <div class="info-item" @click="$router.myPush({ path: '/detail', query: { id: voiceInfo.exhibitId } })">
                <i class="freelog fl-icon-zhuanji"></i>
                <div class="item-value">{{ voiceInfo.exhibitTitle }}</div>
              </div>
              <div v-if="playingInfo && voiceInfo.articleInfo.articleType === 2 && playingInfo.child.itemId === voiceInfo.child.itemId" class="duration">
                时长{{ playingInfo.versionInfo.exhibitProperty.duration | secondsToHMS }}
              </div>
            </div>
            <div
              class="play-voice-btn"
              :class="{ disabled: btnList[0].disabled }"
              @click="playOrPause()"
            >
              <i class="freelog" :class="btnList[0].icon"></i>
              <div class="label">{{ btnList[0].title }}</div>
            </div>
            <div class="btns-area">
              <template v-for="item in btnList.filter((_, i) => [1, 2, 3].includes(i))">
                <div class="btn" :class="{ disabled: item.disabled }" @click="item.operate">
                  <i class="freelog" :class="item.icon"></i>
                  <div class="btn-label">{{ item.title }}</div>
                </div>
              </template>
              <input id="href" class="hidden-input" :value="href" readOnly />
            </div>
            <div class="intro">{{ voiceInfo.child.articleInfo.intro }}</div>
            <div
              class="cover-to-add"
              :class="{ animation: addAnimation }"
              :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
            >
              <img class="cover" :src="voiceInfo.coverImages[0]" />
            </div>
          </div>

          <!-- PC -->
          <div class="pc-detail-wrapper" v-if="!$store.state.inMobile">
            <div ref="cover" class="cover-area">
              <img class="cover" :src="voiceInfo.child.articleInfo.coverImages[0]" v-if="voiceInfo.child.articleInfo.coverImages[0]" />
              <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
            </div>

            <div class="right-area">
              <div class="title-area">
                <img
                  class="auth-link-abnormal"
                  src="../assets/images/auth-link-abnormal.png"
                  v-if="authLinkAbnormal"
                />
                <i class="freelog fl-icon-suoding lock" @click.stop="getAuth()" v-if="voiceInfo.defaulterIdentityType >= 4"></i>
                <my-tooltip class="title" :content="voiceInfo.child.itemTitle">
                  <span>{{ voiceInfo.child.itemTitle }}</span>
                </my-tooltip>
              </div>
              <div class="intro">{{ voiceInfo.child.articleInfo.intro }}</div>
              <div class="info-area">
                <div class="info-item">
                  <i class="freelog fl-icon-gengxinshijian"></i>
                  <div class="item-value">{{ voiceInfo.child.createDate | relativeTime }}</div>
                </div>
                <div class="info-item">
                  <i class="freelog fl-icon-yonghu"></i>
                  <div class="item-value">{{ voiceInfo.signCount | signCount }}</div>
                </div>
                <div class="info-item to-pool" @click="$router.myPush({ path: '/detail', query: { id: voiceInfo.exhibitId } })">
                  <i class="freelog fl-icon-zhuanji"></i>
                  <div class="item-value">{{ voiceInfo.exhibitTitle }}</div>
                </div>
              </div>

              <div class="btns-area">
                <template v-if="playingInfo && voiceInfo.articleInfo.articleType === 2">
                  <div class="duration" v-if="playingInfo.exhibitId !== voiceInfo.exhibitId">
                    时长{{ computedDuration }}
                  </div>
                  <transition name="slide-right">
                    <div class="playing-mark" v-if="playingInfo.exhibitId === voiceInfo.exhibitId && playingInfo.child.itemId === voiceInfo.child.itemId">
                      <play-status :playing="$store.state.playing" />
                      <div class="progress">
                        <span>{{ ($store.state.progress * 1000) | secondsToHMS }}</span>
                        <span class="progress-divider">/</span>
                        <span>{{ playingInfo.child.articleInfo.articleProperty.duration | secondsToHMS }}</span>
                      </div>
                    </div>
                  </transition>
                </template>
                <template v-for="(item, index) in btnList">
                  <div
                    class="btn normal-btn"
                    :class="{ 'play-btn': index === 0, disabled: item.disabled }"
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
        <div v-else class="detail-weigui">
          <!-- mobile -->
          <div class="detail-weigui-mobile" v-if="$store.state.inMobile">
            <div class="mobile">
              <div class="info">
                <div class="info-header">
                  <div ref="cover" class="cover-area">
                    <img class="cover" :src="voiceInfo.coverImages[0]" v-if="voiceInfo.coverImages[0]" />
                    <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
                  </div>
                  <div class="title-area">
                    <img
                      class="auth-link-abnormal"
                      src="../assets/images/auth-link-abnormal.png"
                      v-if="authLinkAbnormal"
                    />
                    <i
                      class="freelog fl-icon-suoding lock"
                      @click.stop="getAuth()"
                      v-if="voiceInfo.defaulterIdentityType >= 4"
                    ></i>
                    <my-tooltip class="title" :content="voiceInfo.exhibitTitle">
                      <span>{{ voiceInfo.exhibitTitle }}</span>
                    </my-tooltip>
                  </div>
                </div>
                <div class="info-area">
                  <div class="info-item">
                    <i class="freelog fl-icon-gengxinshijian"></i>
                    <div class="item-value">{{ voiceInfo.updateDate | relativeTime }}</div>
                  </div>
                  <div class="info-item">
                    <i class="freelog fl-icon-danji"></i>
                    <div class="item-value">{{ total }}</div>
                  </div>
                  <div class="info-item">
                    <i class="freelog fl-icon-yonghu"></i>
                    <div class="item-value">{{ voiceInfo.signCount | signCount }}</div>
                  </div>
                  <div v-if="playingInfo && voiceInfo.articleInfo.articleType === 1" class="duration">
                    时长{{ voiceInfo.versionInfo.exhibitProperty.duration | secondsToHMS }}
                  </div>
                </div>

              </div>
              <span class="freelog fl-icon-ziyuanweiguitishi_yinle weigui-icon"></span>
            </div>
          </div>
          <!-- pc -->
          <div v-else class="detail-weigui-pc">
            <div class="pc">
              <span class="freelog fl-icon-ziyuanweiguitishi_yinle weigui-icon"></span>
              <div class="info">
                <div ref="cover" class="cover-area">
                  <img class="cover" :src="voiceInfo.coverImages[0]" />
                </div>
                <img
                  class="auth-link-abnormal"
                  src="../assets/images/auth-link-abnormal.png"
                  v-if="authLinkAbnormal"
                />
                <i class="freelog fl-icon-suoding lock" @click.stop="getAuth()" v-if="voiceInfo.defaulterIdentityType >= 4"></i>
                <div
                  v-if="voiceInfo.articleInfo.articleType === 1"
                  class="single freelog fl-icon-bokebiaoqian_danji"
                  :class="{ 'opacity-40': authLinkAbnormal }"
                ></div>
                <div v-else class="multiple" :class="{ 'opacity-40': authLinkAbnormal }">
                  <span
                    class="ing freelog fl-icon-bokebiaoqian_lianzaizhong"
                    v-if="voiceInfo.articleInfo.serializeStatus === 0"
                  ></span>
                  <span class="end freelog fl-icon-bokebiaoqian_yiwanjie" v-else></span>
                </div>
  
                <my-tooltip class="title" :content="voiceInfo.exhibitTitle">
                  <span>{{ voiceInfo.exhibitTitle }}</span>
                </my-tooltip>
              </div>
            </div>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { secondsToHMS, showToast } from "@/utils/common";
import voice from "@/components/voice";
import { freelogApp } from 'freelog-runtime'

export default {
  name: "detail-sub",

  components: { playStatus, myTooltip, voice },

  data() {
    return {
      id: "",
      voiceInfo: null,
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
      href: "",
      showIntro: false
    };
  },
  watch: {
    "$route.query.id": {
      handler(cur) {
        if (!cur) return;
        const app = document.getElementById("appPodcast");
        app.scroll({ top: 0 });
        this.id = cur;
        this.getVoiceInfo();
      },
      immediate: true
    },
    "$store.state.lastestAuthList"(cur) {
      const target = cur.find(ele => ele.exhibitId === this.voiceInfo.exhibitId)
      if (target) {
        this.voiceInfo.defaulterIdentityType = target.defaulterIdentityType;
      }
    }
  },
  mounted() {
    this.$store.dispatch("updateLastestAuthList")
  },
  computed: {
    /** 时长 */
    computedDuration() {      
      const min = Math.min(this.voiceInfo.child?.articleInfo?.articleProperty?.duration || 0, 
        this.$store.state.playingInfo.child?.articleInfo?.articleProperty?.duration || 0)
      if (this.voiceInfo.exhibitId === this.$store.state.playingInfo.exhibitId && 
        this.voiceInfo.child && this.voiceInfo.child.itemId === this.$store.state.playingInfo.child.itemId) {
        return secondsToHMS(min)
      }
      return secondsToHMS(this.voiceInfo.child?.articleInfo?.articleProperty?.duration); 
    },

    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.voiceInfo.defaulterIdentityType);
    },

    /** 是否为支持格式 */
    ifSupportMime() {
      const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
      if (this.voiceInfo.articleInfo.articleType === 1) {
        return supportMimeList.includes(this.voiceInfo.versionInfo.exhibitProperty.mime);
      } else {
        return supportMimeList.includes(this.voiceInfo?.child?.articleInfo?.articleProperty?.mime);
      }
    },

    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.$store.state;
      return playing && playingInfo.exhibitId === this.voiceInfo.exhibitId && playingInfo.child.itemId === this.voiceInfo.child.itemId;
    },

    /** 播放中声音信息 */
    playingInfo() {
      return this.$store.state.playingInfo;
    },

    /** 操作按钮群 */
    btnList() {
      const isInPlayList = useMyPlay.ifExist(this.voiceInfo);
      const isCollected = useMyCollection.ifExist(this.voiceInfo);
      return [
        {
          icon:
            this.voiceInfo.articleInfo.articleType === 1
              ? !this.ifSupportMime
                ? "fl-icon-wufabofang"
                : this.playing
                ? "fl-icon-zanting-daibiankuang"
                : "fl-icon-bofang-daibiankuang"
              : "fl-icon-bofang-daibiankuang",
          title: 
              !this.ifSupportMime
                ? "无法播放"
                : this.playing
                ? "暂停"
              : "播放",
          operate: this.playOrPause,
          disabled: !(
            this.voiceInfo.articleInfo.articleType === 2 ||
            (this.voiceInfo.articleInfo.articleType === 1 && this.ifSupportMime)
          )
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          title: "加入播放列表",
          operate: this.addToPlayList,
          disabled: !(this.voiceInfo.articleInfo.articleType === 2 &&
            !isInPlayList &&
            this.ifSupportMime
          )
        },
        {
          icon: isCollected
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          title: isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: this.share }
      ];
    }
  },
  methods: {
    /** 播放/暂停 */
    playOrPause() {
      useMyPlay.playOrPause(this.voiceInfo);
    },

    /** 加入播放列表 */
    async addToPlayList() {
      const { exhibitId, articleInfo, child } = this.voiceInfo
      if (articleInfo.articleType === 2) {
        useMyPlay.addToPlayList({
          id: exhibitId,
          itemId: child.itemId,
          callback: () => {
            const app = document.getElementById("appPodcast");
            const { offsetTop, offsetLeft } = this.$refs.cover;
            this.coverLeft = offsetLeft;
            this.coverTop = offsetTop - app.scrollTop;
            if (this.$store.state.inMobile) this.moreMenuShow = false;
            this.addAnimation = true;
            setTimeout(() => {
              this.addAnimation = false;
            }, 700);
          },
          isExhibit: false
        });
      }
    },

    /** 收藏/取消收藏 */
    operateCollect() {
      useMyCollection.operateCollect(this.voiceInfo);
    },

    /** 分享 */
    share() {
      if (this.$store.state.inMobile) {
        const input = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
        // freelogApp.pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: this.voiceInfo?.exhibitId } });
      } else {
        this.$store.commit("setData", {
          key: "shareInfo",
          value: { show: true, exhibit: this.voiceInfo }
        });
      }
    },

    /** 获取声音详情 */
    async getVoiceInfo() {
      let result = {}
      const itemId = this.$route.query.itemId
      const id = this.$route.query.id
      if (id && itemId) {
        // 处理分享
        const [info, statusInfo, url, detail, subStatusInfo] = await Promise.all([
          freelogApp.getExhibitInfo(id, { isLoadVersionProperty: 1 }),
          freelogApp.getExhibitAuthStatus(id),
          freelogApp.getCollectionSubFileStream(id, {
            itemId: itemId,
            returnUrl: true
          }),
          freelogApp.getCollectionSubInfo(id, {
            itemId: itemId
          }),
          freelogApp.getCollectionSubAuth(id, {
            itemIds: itemId
          }),
        ]); 
        
        info.data.data.defaulterIdentityType = statusInfo.data.data[0].defaulterIdentityType;
        info.data.data.child = detail.data.data
        info.data.data.child.url = url;
        info.data.data.child.authCode = subStatusInfo.data.data[0].authCode;
        result = info.data.data
      }
      this.voiceInfo = result
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.voiceInfo);
    },
  }
};
</script>

<style lang="scss" scoped>
.detail-wrapper {
  // mobile
  .mobile-detail-wrapper {
    padding: 25px 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;

    .cover-area {
      position: relative;
      width: 140px;
      height: 140px;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      z-index: 1;

      .cover {
        height: 100%;
      }
    }

    .title-area {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;

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

      .title {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        line-height: 24px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .info-area {
      color: rgba(255, 255, 255, 0.4);
      display: flex;
      margin-top: 10px;

      .info-item {
        display: flex;
        align-items: center;

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

      .duration {
        font-size: 12px;
        line-height: 18px;
        margin-left: 10px;
      }
    }

    .play-voice-btn {
      width: 240px;
      height: 48px;
      border-radius: 48px;
      color: #222;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 30px;

      &:active {
        background: rgba(255, 255, 255, 0.8);
        color: rgba(34, 34, 34, 0.8);
      }

      &.disabled {
        opacity: 0.24;
        pointer-events: none;
      }

      .freelog {
        font-size: 16px;
      }

      .label {
        font-size: 14px;
        font-weight: 600;
        margin-left: 5px;
      }
    }

    .btns-area {
      display: flex;
      align-items: center;
      margin: 30px 0px;

      .btn {
        padding: 0 10px;
        height: 40px;
        color: rgba(255, 255, 255, 0.6);
        display: flex;
        align-items: center;

        &:active {
          color: rgba(255, 255, 255, 0.4);
        }

        &.disabled {
          opacity: 0.24;
          pointer-events: none;
        }

        & + .btn {
          margin-left: 10px;
        }

        .freelog {
          font-size: 16px;
        }

        .btn-label {
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
          margin-left: 5px;
        }
      }

      .hidden-input {
        position: absolute;
        right: 100vw;
        z-index: -1;
      }
    }

    .intro {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 20px;
      margin-top: 20px;
    }

    .intro-pool {
      display: flex;
      align-items: center;

      .txt {
        font-weight: 400;
        font-size: 14px;
        color: #FFFFFF;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        opacity: 0.6;
        transition: all 1s ease-in-out;

        &.active {
          text-overflow: initial;
          overflow: initial;
          -webkit-line-clamp: initial;
          opacity: 0.7;
        }
      }
      .btn {
        font-size: 12px;
        color: #FFFFFF;
        opacity: 0.6;
        margin-left: 10px;
      }
    }

    .cover-to-add {
      position: fixed;
      width: 140px;
      height: 140px;
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
        animation: to-play-list-mobile 0.7s ease-out forwards;
      }

      .cover {
        height: 100%;
      }

      @keyframes to-play-list-mobile {
        from {
          opacity: 1;
          transform: scale(1);
          right: calc(100vw - var(--left) - 140px);
          bottom: calc(100vh - var(--top) - 140px);
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

  // PC
  .pc-detail-wrapper {
    padding-top: 20px;
    padding-bottom: 30px;
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

        .auth-link-abnormal {
          width: 30px;
          height: 30px;
          margin-right: 20px;
        }

        .lock {
          font-size: 30px;
          color: rgba(255, 255, 255, 0.8);
          margin-right: 20px;
          cursor: pointer;
        }

        .title {
          flex: 1;
          width: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 36px;
          font-weight: 600;
          line-height: 56px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
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
        .to-pool {
          cursor: pointer;
          &:hover {
            color: rgba(255, 255, 255, 0.6);
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

            .progress-divider {
              margin: 0 2px;
            }
          }
        }

        .btn {
          padding: 0 20px;
          height: 38px;
          border-radius: 38px;
          display: flex;
          align-items: center;

          &.disabled {
            opacity: 0.4;
            pointer-events: none;
          }

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
  .detail-weigui {
    .detail-weigui-mobile {
      .mobile {
        text-align: center;
        .info {
          padding-top: 30px;
          padding-bottom: 187px;

          .info-header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;

            .cover-area {
              position: relative;
              width: 48px;
              height: 48px;
              background: #222;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-sizing: border-box;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              z-index: 1;
              margin-right: 20px;
              .cover {
                height: 100%;
              }
            }
        
            .title-area {
              display: flex;
              align-items: center;
              justify-content: center;
        
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
        
              .title {
                font-size: 18px;
                font-weight: 600;
                color: #ffffff;
                line-height: 24px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }
        
          }

          .info-area {
            color: rgba(255, 255, 255, 0.4);
            display: flex;
            justify-content: center;
            margin-top: 10px;
      
            .info-item {
              display: flex;
              align-items: center;
      
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
      
            .duration {
              font-size: 12px;
              line-height: 18px;
              margin-left: 10px;
            }
          }
        }
        .weigui-icon {
          font-size: 165px;
          opacity: 0.4;
        }
      }
    }

    .detail-weigui-pc {
      height: calc(100vh - 146px);
      display: flex;
      justify-content: center;
      align-items: center;
  
      .pc {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 348px;
  
        .weigui-icon {
          font-size: 220px;
          opacity: 0.4;
        }
  
        .info {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 450px;
          margin-top: 40px;
  
          .cover-area {
            position: relative;
            width: 48px;
            height: 48px;
            background: #222;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
            margin-right: 20px;
            .cover {
              height: 100%;
            }
          }
  
          .auth-link-abnormal {
            width: 20px;
            height: 20px;
            margin-right: 10px;
          }
  
          .lock {
            font-size: 20px;
            color: rgba(255, 255, 255, 0.8);
            margin-right: 10px;
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
            color: rgba(255, 255, 255, 0.6);
            font-size: 20px;
            font-weight: 600;
            line-height: 56px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-left: 10px;
          }
  
          .single {
            opacity: 0.32;
            color: #fff;
            font-size: 20px;
          }
  
          .multiple {
            display: flex;
            align-items: center;
            .ing {
              font-size: 20px;
              color: #42c28c;
            }
            .end {
              font-size: 20px;
              color: #e9a923;
            }
          }
  
        }
      }
    }
  }
}

/* detail-fade */
.detail-fade-enter-active {
  transition: all 0.2s ease;
}
.detail-fade-enter {
  opacity: 0;
}

</style>
