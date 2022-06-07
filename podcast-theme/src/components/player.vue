<!-- 播放器 -->
<template>
  <div class="player-wrapper">
    <audio
      ref="player"
      :src="playingInfo ? playingInfo.url : ''"
      @canplay="canplay()"
      @timeupdate="audioPlayUpdate()"
      @ended="nextVoice()"
    />

    <!-- mobile -->
    <div class="mobile-player-wrapper" v-if="$store.state.inMobile"></div>

    <!-- PC -->
    <template v-if="!$store.state.inMobile">
      <transition name="slide-up-fade">
        <div class="pc-player-wrapper" v-if="show">
          <div class="player-wrapper">
            <div class="left-area">
              <i
                class="freelog"
                :class="item.icon"
                v-for="item in leftBtnList"
                :key="item.icon"
                @click="item.operate"
              />
            </div>

            <div class="main-area">
              <div class="cover-area">
                <img class="cover" :src="playingInfo.coverImages[0]" v-if="playingInfo" />
                <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
              </div>
              <div class="info-area">
                <div class="top-area">
                  <template v-if="playingInfo">
                    <div class="title-area">
                      <my-tooltip class="title voice-title" :content="playingInfo.exhibitTitle">
                        <span @click="$router.push({ path: '/voice-detail', query: { id: playingInfo.exhibitId } })">
                          {{ playingInfo.exhibitTitle }}
                        </span>
                      </my-tooltip>
                      <!-- <my-tooltip
                      class="title album-title"
                      :content="'这里是专辑标题这里是专辑标题这里是专辑标题这里是专辑标题这里是专辑标题这里是专辑标题'"
                    >
                      <span @click="$router.push({ path: '/album-detail', query: { id: '123' } })">
                        {{ "这里是专辑标题这里是专辑标题这里是专辑标题这里是专辑标题这里是专辑标题这里是专辑标题" }}
                      </span>
                    </my-tooltip> -->
                    </div>
                    <div class="progress-area" v-if="$store.state.duration">
                      {{ $store.state.progress | secondsToHMS }}/{{ $store.state.duration | secondsToHMS }}
                    </div>
                  </template>
                  <span class="no-data-title" v-else>暂无播放的声音</span>
                </div>
                <div @mousedown="slidingProgress = true">
                  <el-slider
                    class="progress"
                    v-model="$store.state.progress"
                    :min="0"
                    :max="$store.state.duration"
                    :format-tooltip="() => secondsToHMS($store.state.progress)"
                    :disabled="!$store.state.duration"
                    @change="changeProgress"
                  ></el-slider>
                </div>
              </div>
            </div>

            <div class="right-area">
              <i
                :ref="item.name"
                class="freelog"
                :class="item.icon"
                v-for="item in rightBtnList"
                :key="item.icon"
                @click="item.operate"
              />
            </div>
          </div>
        </div>
      </transition>

      <transition name="scale">
        <div class="pc-show-btn" key="showBtn" @click="show = true" v-if="!show">
          <div class="btn-area">
            <i class="freelog fl-icon-shouqi1" />
            <div class="btn-label">打开播放器</div>
          </div>
        </div>
      </transition>

      <transition name="scale">
        <div ref="volumePopup" class="volume-popup" key="volume" v-if="volumePopupShow">
          <el-slider class="progress" v-model="volume" vertical :min="0" :max="100"></el-slider>
        </div>
      </transition>

      <transition name="scale">
        <div ref="playListPopup" class="play-list-popup" key="playList" v-if="playListPopupShow">
          <div class="top-area">
            <div class="popup-title">播放列表</div>
            <div class="top-right">
              <div class="text-btn clear-btn" @click="clearPlayList()">清空列表</div>
              <i class="text-btn freelog fl-icon-zhankaigengduo" @click="playListPopupShow = false"></i>
            </div>
          </div>
          <div class="voice-list" v-if="$store.state.playList">
            <template v-if="$store.state.playList.length">
              <div
                class="voice-item"
                v-for="(item, i) in $store.state.playList"
                :key="item.exhibitId"
                @click="playOrPauseList(item)"
              >
                <div class="left-area">
                  <img class="icon" src="../assets/images/auth-link-abnormal.png" v-if="!item.authLinkNormal" />
                  <img
                    class="icon"
                    src="../assets/images/mini-lock.png"
                    @click.stop="getAuth(item)"
                    v-if="item.authCode === 303"
                  />
                  <div class="title-area">
                    <my-tooltip class="title voice-title" :content="item.exhibitTitle">
                      <span>{{ item.exhibitTitle }}</span>
                    </my-tooltip>
                    <!-- <my-tooltip
                    class="title album-title"
                    :content="'睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊'"
                  >
                    <span>
                      {{ "睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊睡前聊一聊" }}
                    </span>
                  </my-tooltip> -->
                  </div>
                </div>

                <div class="right-area">
                  <play-status
                    :playing="$store.state.playing"
                    :desc="`${secondsToHMS($store.state.progress)}/${secondsToHMS($store.state.duration)}`"
                    v-if="$store.state.playingInfo && $store.state.playingInfo.exhibitId === item.exhibitId"
                  />
                  <div class="duration" v-else>{{ $store.state.duration | secondsToHMS }}</div>
                  <i class="text-btn freelog fl-icon-guanbi" @click.stop="deleteVoice(item.exhibitId)"></i>
                </div>
              </div>
            </template>
            <div class="no-data-tip" v-else>暂无任何声音</div>
          </div>
          <el-skeleton class="skeleton" :rows="8" animated v-if="!$store.state.playList" />
        </div>
      </transition>
    </template>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";
import { useMyAuth, useMyPlay, useMyCollection } from "@/utils/hooks";
import { secondsToHMS } from "@/utils/common";

export default {
  name: "my-player",

  components: {
    playStatus,
    myTooltip,
  },

  data() {
    return {
      show: false,
      playing: false,
      volumePopupShow: false,
      volume: null,
      playListPopupShow: false,
      playingInfo: null,
      slidingProgress: false,
    };
  },

  watch: {
    "$store.state.playingInfo": {
      handler(cur) {
        this.$store.commit("setData", { key: "progress", value: 0 });
        this.$store.commit("setData", { key: "duration", value: null });
        this.playingInfo = cur;
      },
      deep: true,
    },

    "$store.state.playing"(cur) {
      if (!this.$store.state.playingInfo.url) return;

      if (cur) {
        this.$refs.player.play();
      } else {
        this.$refs.player.pause();
      }
    },

    volume(cur) {
      this.$refs.player.volume = cur / 100;
      localStorage.setItem("volume", cur);
    },
  },

  computed: {
    /** 是否收藏 */
    isCollected() {
      const { collectionIdList, playingInfo } = this.$store.state;
      return playingInfo ? collectionIdList.includes(playingInfo.exhibitId) : false;
    },

    /** 左区域按钮群 */
    leftBtnList() {
      return [
        { icon: "fl-icon-shangyishou1", operate: this.preVoice },
        {
          icon: this.$store.state.playing ? "fl-icon-zanting-daibiankuang" : "fl-icon-bofang-daibiankuang",
          operate: this.playOrPause,
        },
        { icon: "fl-icon-xiayishou1", operate: this.nextVoice },
      ];
    },

    /** 右区域按钮群 */
    rightBtnList() {
      return [
        {
          name: "volume",
          icon: this.volume ? "fl-icon-yinliang" : "fl-icon-jingyin",
          operate: () => {
            this.volumePopupShow = !this.volumePopupShow;
          },
        },
        {
          name: "collect",
          icon: this.isCollected ? "fl-icon-shoucangxiaoshuoyishoucang" : "fl-icon-shoucangxiaoshuo",
          operate: this.operateCollect,
        },
        {
          name: "playList",
          icon: "fl-icon-xiaoshuomulu1",
          operate: () => {
            this.playListPopupShow = !this.playListPopupShow;
          },
        },
        { name: "showBtn", icon: "fl-icon-shouqi1", operate: this.closePlayer },
      ];
    },
  },

  created() {
    this.clickListener();
  },

  mounted() {
    const volume = localStorage.getItem("volume") || 50;
    this.volume = Number(volume);
  },

  methods: {
    secondsToHMS,

    /** 关闭播放器 */
    closePlayer() {
      this.show = false;
      this.volumePopupShow = false;
      this.playListPopupShow = false;
    },

    /** 上一首 */
    preVoice() {
      useMyPlay.preVoice();
    },

    /** 下一首 */
    nextVoice() {
      useMyPlay.nextVoice();
    },

    /** 播放/暂停 */
    playOrPause() {
      useMyPlay.playOrPause(this.playingInfo);
    },

    // 收藏/取消收藏
    async operateCollect() {
      useMyCollection.operateCollect(this.playingInfo);
    },

    /** 格式化进度条 */
    formatTooltip() {
      return "03:21";
    },

    /** 播放/暂停播放列表 */
    playOrPauseList(data) {
      useMyPlay.playOrPause(data);
    },

    /** 移出播放列表 */
    deleteVoice(id) {
      useMyPlay.removeFromPlayList(id);
    },

    /** 清空播放列表 */
    clearPlayList() {
      useMyPlay.clearPlayList();
    },

    /** 授权 */
    async getAuth(data) {
      useMyAuth.getAuth(data);
    },

    /** 监听点击区域 */
    clickListener() {
      document.addEventListener("click", (e) => {
        if (!this.show) return;

        if (this.volumePopupShow) {
          const volumePopup = this.$refs.volumePopup;
          const volume = this.$refs.volume[0];
          if (app.contains(e.target) && !volumePopup.contains(e.target) && !volume.contains(e.target)) {
            this.volumePopupShow = false;
          }
        }

        if (this.playListPopupShow) {
          const playListPopup = this.$refs.playListPopup;
          const playList = this.$refs.playList[0];
          if (app.contains(e.target) && !playListPopup.contains(e.target) && !playList.contains(e.target)) {
            this.playListPopupShow = false;
          }
        }
      });
    },

    /** 加载完成 */
    canplay() {
      const { duration } = this.$refs.player;
      this.$store.commit("setData", { key: "duration", value: duration });
      if (this.$store.state.playing) this.$refs.player.play();
    },

    /** 音频播放时间变化 */
    audioPlayUpdate() {
      if (this.slidingProgress) return;

      const progress = this.$refs.player.currentTime;
      this.$store.commit("setData", { key: "progress", value: progress });
    },

    /** 改变音频进度 */
    changeProgress(e) {
      this.$refs.player.currentTime = e;
      this.slidingProgress = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.player-wrapper {
  // PC
  .pc-player-wrapper {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    height: 84px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(25px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 102;

    .player-wrapper {
      position: relative;
      width: 1130px;
      height: 100%;
      display: flex;
      align-items: center;

      .left-area {
        display: flex;

        .freelog {
          font-size: 36px;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            color: #fff;
          }

          &:active {
            color: rgba(255, 255, 255, 0.6);
          }

          & + .freelog {
            margin-left: 15px;
          }
        }
      }

      .main-area {
        display: flex;
        margin-left: 41px;

        .cover-area {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;

          .cover {
            height: 100%;
          }

          .default-avatar {
            width: 20px;
            height: 20px;
          }
        }

        .info-area {
          width: 685px;
          height: fit-content;
          margin-left: 15px;

          .top-area {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .title-area {
              width: 535px;
              display: flex;
              font-size: 14px;
              font-weight: 600;
              line-height: 20px;

              .title {
                flex: 1;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                cursor: pointer;
                transition: all 0.2s linear;

                &.voice-title {
                  color: rgba(255, 255, 255, 0.8);
                }

                &.album-title {
                  color: rgba(255, 255, 255, 0.2);
                  margin-left: 15px;
                }

                &:hover {
                  color: #fff;
                  text-decoration: underline;
                }
              }
            }

            .no-data-title {
              font-size: 14px;
              font-weight: 600;
              line-height: 20px;
              color: rgba(255, 255, 255, 0.4);
            }

            .progress-area {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.4);
              line-height: 18px;
            }
          }

          .progress {
            width: 100%;
            height: 4px;
            margin-top: 13px;

            ::v-deep .el-slider__runway {
              margin: 0;
              height: 4px;

              .el-slider__bar {
                height: 4px;
              }

              .el-slider__button-wrapper {
                width: 12px;
                height: 12px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                align-items: center;
                justify-content: center;

                .el-slider__button {
                  width: 12px;
                  height: 12px;
                  border: none;
                  cursor: pointer;
                }
              }
            }
          }
        }
      }

      .right-area {
        display: flex;
        margin-left: 29px;

        .freelog {
          width: 30px;
          height: 30px;
          border-radius: 4px;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s linear;

          &:hover {
            background-color: rgba(255, 255, 255, 0.06);
          }

          &:active {
            background-color: rgba(255, 255, 255, 0.03);
          }

          & + .freelog {
            margin-left: 18px;
          }
        }
      }
    }

    .second-text-btn {
      font-size: 12px;
    }
  }

  .pc-show-btn {
    position: fixed;
    right: 154px;
    bottom: 0;
    height: 30px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px 4px 0px 0px;
    backdrop-filter: blur(25px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.2s linear;
    cursor: pointer;
    z-index: 101;

    .btn-area {
      display: flex;
      align-items: center;
      max-width: 30px;
      padding: 0 6px;
      color: rgba(255, 255, 255, 0.4);
      box-sizing: border-box;
      transition: all 0.3s ease;

      &:hover {
        max-width: 300px;
        color: rgba(255, 255, 255, 0.6);
        transition: all 1s ease;
      }

      &:active {
        color: rgba(255, 255, 255, 0.4);
      }

      .freelog {
        font-size: 18px;
        transform: rotate(180deg);
      }

      .btn-label {
        font-size: 14px;
        margin-left: 6px;
        flex-shrink: 0;
      }
    }
  }

  .volume-popup {
    position: absolute;
    right: calc(50% - 565px + 129px);
    bottom: 94px;
    width: 60px;
    height: 160px;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    backdrop-filter: blur(25px);
    display: flex;
    align-items: center;
    justify-content: center;

    .progress {
      width: 4px;
      height: 130px;

      ::v-deep .el-slider__runway {
        margin: 0;
        width: 4px;

        .el-slider__bar {
          width: 4px;
        }

        .el-slider__button-wrapper {
          width: 12px;
          height: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;

          .el-slider__button {
            width: 12px;
            height: 12px;
            border: none;
            cursor: pointer;
          }
        }
      }
    }
  }

  .play-list-popup {
    position: absolute;
    right: calc(50% - 565px + 38px);
    bottom: 94px;
    width: 680px;
    height: 350px;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    backdrop-filter: blur(25px);
    display: flex;
    flex-direction: column;

    .top-area {
      width: 100%;
      height: 48px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      box-sizing: border-box;

      .popup-title {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.4);
        line-height: 18px;
      }

      .top-right {
        display: flex;
        align-items: center;

        .clear-btn {
          font-size: 12px;
          line-height: 18px;
        }

        .freelog {
          font-size: 7px;
          transform: rotate(90deg);
          margin-left: 20px;
          color: rgba(153, 153, 153, 0.4);
        }
      }
    }

    .voice-list {
      padding: 20px 0;
      flex: 1;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 5px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0.3);
      }

      .voice-item {
        width: 100%;
        height: 38px;
        padding: 0 20px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.2s linear;

        &:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .left-area {
          display: flex;
          align-items: center;

          .icon {
            width: 16px;
            height: 16px;
            margin-right: 5px;
          }

          .title-area {
            width: 415px;
            display: flex;

            .title {
              flex: 1;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;

              & + .title {
                margin-left: 15px;
              }

              &.voice-title {
                color: rgba(255, 255, 255, 0.8);
              }

              &.album-title {
                color: rgba(255, 255, 255, 0.2);
              }
            }
          }
        }

        .right-area {
          display: flex;
          align-items: center;

          .duration {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
            line-height: 18px;
          }

          .freelog {
            font-size: 10px;
            margin-left: 20px;
            color: rgba(153, 153, 153, 0.4);
          }
        }
      }

      .no-data-tip {
        width: 100%;
        text-align: center;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.2);
        line-height: 20px;
        margin-top: 116px;
      }
    }

    .skeleton {
      width: 100%;
      padding: 20px;
      box-sizing: border-box;

      ::v-deep .el-skeleton.is-animated .el-skeleton__item {
        background: linear-gradient(90deg, rgb(70, 70, 70) 25%, rgb(50, 50, 50) 37%, rgb(70, 70, 70) 63%) 0% 0% / 400%
          100%;
      }
    }
  }
}
</style>
