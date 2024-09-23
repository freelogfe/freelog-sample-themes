<!-- 播放器 -->

<template>
  <div class="player-wrapper">
    <audio
      ref="player"
      :src="computedSrc"
      @loadedmetadata="loadedVoice()"
      @timeupdate="$store.state.initUrl === null && audioPlayUpdate()"
      @ended="$store.state.initUrl === null && endVoice()"
      @error="$store.state.initUrl === null && playError($event)"
      @waiting="handleWaiting"
      @durationchange="handleDurationchange"
    />

    <!-- mobile -->
    <div class="mobile-player-wrapper" v-if="$store.state.inMobile">
      <div class="player" :class="{ show: playerShow }">
        <div class="cover-area">
          <img class="cover" :src="computedCover" v-if="playingInfo && computedCover" />
          <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
        </div>
        <div ref="infoArea" class="info-area">
          <div
            class="info-map"
            :style="{ '--touchMoveX': touchMoveX + 'px' }"
            @touchstart="touchStart"
            @touchmove="touchMove"
            @touchend="touchEnd"
            v-if="playingInfo"
          >
            <div
              class="info"
              :style="{ '--infoAreaWidth': infoAreaWidth + 'px' }"
              v-for="item in playList"
              :key="`${item.exhibitId}-${item.child ? item.child.itemId : ''}`"
            >
              <div
                class="title voice-title"
                @click="skipToDetailPage"
              >
                {{ computedExhibitTitle(item) }}
              </div>
            </div>
          </div>
          <div class="no-data-title" v-else>暂无播放的声音</div>
        </div>
        <div class="btns-area">
          <div class="play-btn-area" @click="playOrPause()">
            <!-- ios的safari上, 两个圆环并不能完美的重叠 -->
            <!-- <i
              class="freelog play"
              :class="playing ? 'fl-icon-zanting-daibiankuang' : 'fl-icon-bofang-daibiankuang'"
            ></i> -->
            <div class="play-img">
              <img src="../assets/images/current-play.png" alt="" v-if="playing">
              <img src="../assets/images/current-stop.png" alt="" v-else>
            </div>
            <el-progress
              v-if="percentage > 0.2"
              class="circle-progress"
              type="circle"
              :percentage="percentage"
              color="white"
              :width="30"
              :stroke-width="2"
              :show-text="false"
            />
          </div>
          <i class="freelog fl-icon-jiarubofangliebiao" @click="openPlayList()"></i>
        </div>
        <div class="progress-box" @touchstart="slidingProgress = true" v-if="slientFresh">
          <el-slider
            class="progress"
            :class="{ 'no-voice': !playingInfo }"
            v-model="$store.state.progress"
            :min="0"
            :max="computedSlider"
            :show-tooltip="false"
            @change="changeProgress"
          ></el-slider>
        </div>
      </div>

      <transition name="fade">
        <div class="mobile-play-list-modal" @click="closePlayList()" v-if="playListPopupShow"></div>
      </transition>
      <div class="mobile-play-list-popup" :class="{ show: playListPopupShow }">
        <div class="top-area">
          <div class="popup-title">
            播放列表<span v-if="playList">（{{ playList.length }}）</span>
          </div>
          <div
            class="clear-btn"
            @click="confirmDialogShow = true"
            v-if="playList && playList.length"
          >
            清空列表
          </div>
        </div>
        <div class="voice-list" v-if="playList">
          <template v-if="playList.length">
            <div
              class="voice-item"
              v-for="(item, index) in playList"
              :key="`${item.exhibitId}-${item.child ? item.child.itemId : ''}`"
              @click="playOrPauseList(item)"
            >
              <div class="left-area">
                <div class="title-area">
                  <img
                    class="icon"
                    src="../assets/images/auth-link-abnormal.png"
                    v-if="![0, 4].includes(item.defaulterIdentityType)"
                  />
                  <i
                    class="freelog fl-icon-suoding lock"
                    @click.stop="getAuth(item)"
                    v-if="item.defaulterIdentityType >= 4"
                  ></i>
                  <div class="voice-title">{{ computedExhibitTitle(item) }}</div>
                </div>

                <div class="duration-area">
                  <play-status
                    :playing="playing"
                    :desc="computedDuration"
                    v-if="computedPlayStatus(item)"
                  />
                  <div class="duration" v-else>
                    {{ computedFixDuration(item) }}
                  </div>
                </div>
              </div>

              <div class="delete-btn" @click.stop="deleteVoice(item)">
                <i class="text-btn mobile freelog fl-icon-guanbi"></i>
              </div>
            </div>
          </template>
          <div class="no-data-tip" v-else>暂无任何声音</div>
        </div>
        <el-skeleton class="skeleton" :rows="8" animated v-if="!playList" />
        <div class="close-btn" @click="closePlayList()">关闭</div>
      </div>

      <transition name="fade">
        <div class="confirm-dialog-modal" v-if="confirmDialogShow">
          <div class="confirm-dialog">
            <div class="desc">清空列表会移除播放列表中的全部声音</div>
            <div class="btns">
              <div class="btn cancel" @click="confirmDialogShow = false">取消</div>
              <div class="btn sure" @click="clearPlayList()">清空</div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- PC -->
    <template v-if="$store.state.inMobile === false">
      <transition name="slide-up-fade">
        <div
          class="pc-player-wrapper"
          @mouseover="clearCloseTimer()"
          @mouseout="handleMouseout"
          v-if="show"
        >
          <div class="player-wrapper">
            <div class="left-area">
              <i
                class="freelog"
                :class="{ [item.icon]: true, disabled: item.disabled }"
                v-for="item in leftBtnList"
                :key="item.icon"
                @click="item.operate"
              />
            </div>

            <div class="main-area">
              <div class="cover-area">
                <img class="cover" :src="computedCover" v-if="playingInfo && computedCover" />
                <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
              </div>
              <div class="info-area">
                <div class="top-area">
                  <template v-if="playingInfo">
                    <div class="title-area">
                      <my-tooltip class="title voice-title" :content="computedExhibitTitle(playingInfo)">
                        <span
                          @click="skipToDetailPage"
                        >
                          {{ computedExhibitTitle(playingInfo) }}
                        </span>
                      </my-tooltip>
                    </div>
                    <div class="progress-area">
                      {{ ($store.state.progress * 1000) | secondsToHMS }} /
                      {{ computedFixDuration(playingInfo) }}
                    </div>
                  </template>
                  <span class="no-data-title" v-else>暂无播放的声音</span>
                </div>
                <div @mousedown="slidingProgress = true" v-if="slientFresh">
                  <el-slider
                    class="progress"
                    :class="{ 'no-voice': !playingInfo }"
                    v-model="$store.state.progress"
                    :min="0"
                    :max="computedSlider"
                    :format-tooltip="() => secondsToHMS($store.state.progress * 1000)"
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
        <div ref="volumePopup" class="pc-volume-popup" key="volume" v-if="volumePopupShow">
          <el-slider class="progress" v-model="volume" vertical :min="0" :max="100"></el-slider>
        </div>
      </transition>

      <transition name="scale">
        <div ref="playListPopup" class="pc-play-list-popup" key="playList" v-if="playListPopupShow">
          <div class="top-area">
            <div class="popup-title">播放列表</div>
            <div class="top-right">
              <div class="text-btn clear-btn" @click="clearPlayList()" v-if="playList.length">
                清空列表
              </div>
              <i
                class="text-btn freelog fl-icon-zhankaigengduo"
                @click="playListPopupShow = false"
              ></i>
            </div>
          </div>
          <div class="voice-list" v-if="playList">
            <template v-if="playList.length">
              <div
                class="voice-item"
                v-for="(item, index) in playList"
                :key="`${item.exhibitId}-${item.child ? item.child.itemId : ''}`"
                @click="playOrPauseList(item)"
              >
                <div class="left-area">
                  <img
                    class="icon"
                    src="../assets/images/auth-link-abnormal.png"
                    v-if="![0, 4].includes(item.defaulterIdentityType)"
                  />
                  <i
                    class="freelog fl-icon-suoding lock"
                    @click.stop="getAuth(item)"
                    v-if="item.defaulterIdentityType >= 4"
                  ></i>
                  <div class="title-area">
                    <my-tooltip class="title voice-title" :content="computedExhibitTitle(item)">
                      <span>{{ computedExhibitTitle(item) }}</span>
                    </my-tooltip>
                  </div>
                </div>

                <div class="right-area">
                  <play-status
                    :playing="playing"
                    :desc="computedDuration"
                    v-if="computedPlayStatus(item)"
                  />
                  <div class="duration" v-else>
                    {{ computedFixDuration(item) }}
                  </div>
                  <i
                    class="text-btn freelog fl-icon-guanbi"
                    @click.stop="deleteVoice(item)"
                  ></i>
                </div>
              </div>
            </template>
            <div class="no-data-tip" v-else>暂无任何声音</div>
          </div>
          <el-skeleton class="skeleton" :rows="8" animated v-if="!playList" />
        </div>
      </transition>
    </template>
  </div>
</template>

<script>
import playStatus from "@/components/play-status";
import myTooltip from "@/components/tooltip";
import { useMyAuth, useMyPlay, useMyCollection } from "@/utils/hooks";
import { secondsToHMS, showToast } from "@/utils/common";

export default {
  name: "my-player",

  components: {
    playStatus,
    myTooltip
  },

  data() {
    return {
      playList: null,
      show: false,
      volumePopupShow: false,
      volume: null,
      playerShow: true,
      playListPopupShow: false,
      confirmDialogShow: false,
      playingInfo: null,
      slidingProgress: false,
      timeout: null,
      infoAreaWidth: 0,
      startTouchX: 0,
      touchMoveX: 0,
      closeTimer: null,
      slientFresh: true
    };
  },

  watch: {
    "$store.state.playList": {
      handler(cur, pre) {
        this.playList = cur;
        // 加入播放列表，显示播放器动画
        if (cur && pre && cur.length - pre.length === 1) this.animation();
        if (!cur || !this.$store.state.inMobile) return;

        if (!this.infoAreaWidth) {
          this.infoAreaWidth = this.$refs.infoArea?.clientWidth;
        }

        if (this.playingInfo) {
          const index = cur.findIndex(item => {
            if (this.playingInfo.articleInfo.articleType === 1) {
              return item.exhibitId === this.playingInfo.exhibitId
            } else {
              return item.exhibitId === this.playingInfo.exhibitId && item.child.itemId === this.playingInfo.child.itemId
            }
          });
          this.touchMoveX = -this.infoAreaWidth * index;
        }
      },
      immediate: true
    },

    "$store.state.playingInfo": {
      handler(cur) {
        this.playingInfo = cur;

        if (this.playList && this.$store.state.inMobile) {
          const index = this.playList.findIndex(
            item => {
              if (this.playingInfo.articleInfo.articleType === 1) {
                return item.exhibitId === this.playingInfo.exhibitId
              } else {
                return item.exhibitId === this.playingInfo.exhibitId && item.child.itemId === this.playingInfo.child.itemId
              }
            }
          );
          this.touchMoveX = -this.infoAreaWidth * index;
        }
      },
      deep: true
    },

    "$store.state.playing"(cur) {
      if (!this.$store.state.playingInfo) return;
      if (cur) {
        this.playVoice();
      } else {
        this.$refs.player.pause();
      }
    },

    "$store.state.initUrl"(cur) {
      if (cur) {
        this.$refs.player.volume = 0;
      } else {
        this.$refs.player.volume = this.volume / 100;
      }
    },

    "$store.state.inMobile"(cur) {
      const appElement = document.getElementById("appPodcast");
      if (cur) {
        appElement.addEventListener("touchend", () => {
          this.slidingProgress = false;
        });
      } else {
        appElement.addEventListener("mouseup", () => {
          this.slidingProgress = false;
        });
      }
    },

    volume(cur) {
      this.$refs.player.volume = cur / 100;
      localStorage.setItem("volume", cur);
    }
  },

  computed: {
     /** 封面 */
     computedCover() {
      if (this.playingInfo.articleInfo.articleType === 1) {
        return this.playingInfo.coverImages[0];
      } else {
        if (this.playingInfo?.child?.articleInfo?.coverImages[0]) {
          return this.playingInfo?.child?.articleInfo?.coverImages[0];
        }
        return '';
      }
    },
    /** 固定播放时长 */
    computedSlider() {
      if (this.playingInfo?.articleInfo?.articleType === 1) {
        return this.playingInfo && this.playingInfo.versionInfo.exhibitProperty.duration / 1000
      } else {
        return this.playingInfo && 
          this.playingInfo.child && 
          this.playingInfo.child.articleInfo && 
          this.playingInfo.child.articleInfo.articleProperty && 
          this.playingInfo.child.articleInfo.articleProperty.duration / 1000
      }
    },
    /** 固定播放时长 */
    computedFixDuration() {
      return item => {
        if (item && item.articleInfo && item.articleInfo.articleType === 1) {
          return secondsToHMS(item.versionInfo.exhibitProperty.duration);
        } else {
          return secondsToHMS(item?.child?.articleInfo?.articleProperty?.duration);
        }
      };
    },
    /** 播放状态 */
    computedPlayStatus() {
      return item => {
        if (this.playingInfo && this.playingInfo.articleInfo.articleType === 1) {
          return this.playingInfo && this.playingInfo.exhibitId === item.exhibitId;
        } else {
          return (
            this.playingInfo &&
            this.playingInfo.exhibitId === item.exhibitId &&
            this.playingInfo.child.itemId === item.child.itemId
          );
        }
      };
    },
    /** 动态播放时长 */
    computedDuration() {
      const { playingInfo } = this.$store.state
      if (playingInfo && playingInfo.articleInfo && playingInfo.articleInfo.articleType === 1) {
        return `${secondsToHMS(this.$store.state.progress * 1000)} / ${secondsToHMS(
          playingInfo.versionInfo.exhibitProperty.duration
        )}`;
      } else {
        return `${secondsToHMS(this.$store.state.progress * 1000)} / ${secondsToHMS(
          playingInfo.child.articleInfo.articleProperty.duration
        )}`;
      }
    },
    /** 播放title */
    computedExhibitTitle() {
      return item => {
        if (item && item.articleInfo && item.articleInfo.articleType === 1) {
          return item.exhibitTitle;
        } else {
          return item?.child?.itemTitle || "";
        }
      };
    },
    /** 播放地址 */
    computedSrc() {
      if (this.$store.state.initUrl) {
        return this.$store.state.initUrl;
      } else {
        if (this.playingInfo) {
          if (this.playingInfo.articleInfo.articleType === 1) {
            return this.playingInfo.url;
          } else {
            return this.playingInfo.child && this.playingInfo.child.url;
          }
        } else {
          return "";
        }
      }
    },
    /** 是否收藏 */
    isCollected() {
      const { collectionIdList, playingInfo } = this.$store.state;
      return playingInfo ? collectionIdList.map(ele => ele.id).includes(playingInfo.exhibitId) : false;
    },

    /** 是否播放中 */
    playing() {
      return this.$store.state.playing;
    },

    /** 播放进度 */
    percentage() {
      if (this.playingInfo) {
        let duration 
        if (this.playingInfo.articleInfo.articleType === 1) {
          duration = this.playingInfo.versionInfo.exhibitProperty.duration;
        } else {
          duration = this.playingInfo.child.articleInfo.articleProperty.duration
        }
        if (duration) {
          const progress = ((this.$store.state.progress * 1000) / duration) * 100;
          return Math.min(100, progress);
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    },

    /** 左区域按钮群 */
    leftBtnList() {
      return [
        {
          icon: "fl-icon-shangyishou1",
          operate: this.preVoice,
          disabled: this.$store.state.playList && this.$store.state.playList.length <= 1
        },
        {
          icon: this.playing ? "fl-icon-zanting-daibiankuang" : "fl-icon-bofang-daibiankuang",
          operate: this.playOrPause
        },
        {
          icon: "fl-icon-xiayishou1",
          operate: this.nextVoice,
          disabled: this.$store.state.playList && this.$store.state.playList.length <= 1
        }
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
          }
        },
        {
          name: "collect",
          icon: this.isCollected
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          operate: this.operateCollect
        },
        {
          name: "playList",
          icon: "fl-icon-xiaoshuomulu1",
          operate: () => {
            this.playListPopupShow = !this.playListPopupShow;
          }
        },
        { name: "showBtn", icon: "fl-icon-shouqi1", operate: this.closePlayer }
      ];
    }
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

    /** 跳转到声音详情 */
    async skipToDetailPage() {
      if (this.playingInfo.articleInfo.articleType === 1) {
        this.$router.myPush({ path: '/detail', query: { id: this.playingInfo.exhibitId } })
      } else {
        this.$router.myPush({ 
          path: '/detail-sub', 
          query: { 
            id: this.playingInfo.exhibitId, 
            itemId: this.playingInfo.child.itemId
          } 
        })
      }
    },

    /** 鼠标移出 */
    handleMouseout() {
      this.animation('kill')
    },

    /** 关闭播放器 */
    closePlayer() {
      this.show = false;
      this.volumePopupShow = false;
      this.playListPopupShow = false;
    },

    /** 打开播放列表（移动端） */
    openPlayList() {
      this.playerShow = false;
      setTimeout(() => {
        this.playListPopupShow = true;
      }, 300);
    },

    /** 关闭播放列表（移动端） */
    closePlayList() {
      this.playListPopupShow = false;
      setTimeout(() => {
        this.playerShow = true;
      }, 300);
    },

    /** 上一首 */
    preVoice() {
      useMyPlay.preVoice();
    },

    /** 下一首 */
    nextVoice() {
      useMyPlay.nextVoice();
    },

    /** 播放完成 */
    endVoice() {
      this.$store.commit("setData", { key: "playing", value: false });
      if (this.playList.length === 1) {
        this.$store.commit("setData", { key: "progress", value: 0 });
        return;
      }
      this.nextVoice();
    },
    /** 播放失败 */
    async playError(event) {      
      const mediaError = this.$refs.player.error
      if (!mediaError) return 
      switch (mediaError.code) {
        case 1:
          // 用户终止了媒体的加载
          break;
        case 2:
          // 媒体加载过程中发生网络错误
          break;
        case 3:
          // 媒体播放时发生解码错误
          break;
        case 4:
          // 浏览器不支持媒体文件格式
          break;
        default:
          // 其他错误
          break;
      }
      console.warn(mediaError.code, mediaError.message)

      if (await this.requestTry()) return
      
      if (!this.playing) return;
    },

    /** 因为暂时性缺少数据，播放暂停 */
    async handleWaiting(event) {
      await this.requestTry()
    },

    /** 播放总时长变化 */
    async handleDurationchange(event) {
      if (this.playingInfo.articleInfo.articleType === 1) {
        this.playingInfo.versionInfo.exhibitProperty.duration = this.$refs.player.duration * 1000
      } else {
        this.playingInfo.child.articleInfo.articleProperty.duration = this.$refs.player.duration * 1000
      }
    },

    /** 主动进行一次请求 */
    async requestTry() {
      let url
      const playingInfo = this.$store.state.playingInfo
      if (playingInfo) {
        if (playingInfo.articleInfo.articleType === 1) {
          url = playingInfo.url
        } else {
          url = playingInfo.child.url
        }
      }

      // 请求一次url, 看是否是授权导致的播放失败
      const res = await fetch(url,  { credentials: "include" })
      
      if (res.status === 401) {
        // 暂停播放
        this.$store.commit("setData", { key: "playing", value: false })

        // 初始化url: 解决audio的src地址前后都是同一个造成不发起请求的问题
        // https://file.testfreelog.com/exhibits/64d1ed97cc4a64002f632b0d
        if (this.playingInfo.articleInfo.articleType === 1) {
          this.playingInfo.url = "" 
        } else {
          this.playingInfo.child.url = ""
        }

        // 更新lastestAuthList的授权状态, 会自动更新其他列表的授权状态
        await this.$store.dispatch("updateLastestAuthList")

        const target = this.$store.state.lastestAuthList.find(ele => ele.exhibitId === this.playingInfo.exhibitId)
        if (!target) return
        const resJson = await res.json()

        // 若是展品无授权, 则调出授权; 若是单品, 合集展品授权正常, 但是此单品被封禁, 则进行toast提示;
        if (target.defaulterIdentityType === 4) {
          await useMyAuth.getAuth(this.playingInfo, true)
        } else if (this.playingInfo.child && target.defaulterIdentityType === 0 && resJson.data.authCode === 403) {
          showToast("资源被封禁, 暂无法播放!")
        }

        return true
      } 
    },

    /** 播放/暂停 */
    playOrPause() {
      useMyPlay.playOrPause(this.playingInfo);
    },

    // 收藏/取消收藏
    async operateCollect() {
      useMyCollection.operateCollect(this.playingInfo);
    },

    /** 播放/暂停播放列表 */
    playOrPauseList(data) {
      useMyPlay.playOrPause(data);
    },

    /** 移出播放列表 */
    deleteVoice(item) {
      useMyPlay.removeFromPlayList(item);
    },

    /** 清空播放列表 */
    async clearPlayList() {
      await useMyPlay.clearPlayList();
      this.confirmDialogShow = false;
      this.$refs.player.currentTime = 0;
      this.slientFresh = false
      this.$nextTick(() => {
        this.slientFresh = true
      })
    },

    /** 授权 */
    async getAuth(data) {
      useMyAuth.getAuth(data);
    },

    /** 监听点击区域 */
    clickListener() {
      document.addEventListener("click", e => {
        const app = document.getElementById("appPodcast");
        if (!this.show || this.$store.state.inMobile) return;

        if (this.volumePopupShow) {
          const volumePopup = this.$refs.volumePopup;
          const volume = this.$refs.volume[0];
          if (
            app.contains(e.target) &&
            !volumePopup.contains(e.target) &&
            !volume.contains(e.target)
          ) {
            this.volumePopupShow = false;
          }
        }

        if (this.playListPopupShow) {
          const playListPopup = this.$refs.playListPopup;
          const playList = this.$refs.playList[0];
          if (
            app.contains(e.target) &&
            !playListPopup.contains(e.target) &&
            !playList.contains(e.target)
          ) {
            this.playListPopupShow = false;
          }
        }
      });
    },

    /** 加载完成 */
    loadedVoice() {
      this.playVoice();
    },

    /** 播放声音 */
    playVoice() {
      if (!this.playing) return;  
      this.$refs.player.play();        
      // 播放音频，显示播放器动画
      this.animation();
      // const { isIOS } = this.$store.state;
      // if (isIOS) {
      //   // ios 设备第一次播放音频会失败，需要重新播放一次才会正常
      //   this.$nextTick(() => {
      //     this.$refs.player.pause();
      //     this.$refs.player.play();
      //   });
      // }
    },

    /** 音频播放时间变化 */
    audioPlayUpdate() {
      if (this.slidingProgress || !this.$store.state.playing) return;

      const progress = this.$refs.player.currentTime;
      
      this.$store.commit("setData", { key: "progress", value: progress });
    },

    /** 改变音频进度 */
    changeProgress(e) {
      this.slidingProgress = false;
      this.$refs.player.currentTime = e;
      if (!this.playing) this.playOrPause();
    },

    /** 开始划动声音 */
    touchStart(e) {
      if (this.playList && this.playList.length > 1) {
        this.startTouchX = e.changedTouches[0].clientX;
      }
    },

    /** 划动声音 */
    touchMove(e) {
      if (this.playList && this.playList.length > 1) {
        const index = this.playList.findIndex(
          item => {
            if (this.playingInfo.articleInfo.articleType === 1) {
              return item.exhibitId === this.playingInfo.exhibitId
            } else {
              return item.exhibitId === this.playingInfo.exhibitId && item.child.itemId === this.playingInfo.child.itemId
            }
          }
        );
        const basicX = -this.infoAreaWidth * index;
        const offset = e.changedTouches[0].clientX - this.startTouchX;
        this.touchMoveX = basicX + offset * 1.5;
      }
    },

    /** 结束划动声音 */
    touchEnd() {
      if (this.playList && this.playList.length > 1) {
        const index = this.playList.findIndex(
          item => {
            if (this.playingInfo.articleInfo.articleType === 1) {
              return item.exhibitId === this.playingInfo.exhibitId
            } else {
              return item.exhibitId === this.playingInfo.exhibitId && item.child.itemId === this.playingInfo.child.itemId
            }
          }
        );
        const basicX = -this.infoAreaWidth * index;
        const areaWidth = this.$refs.infoArea.clientWidth;
        const offset = basicX - this.touchMoveX;
        if (Math.abs(offset) < (areaWidth * 2) / 5) {
          // 不切
          this.touchMoveX = -this.infoAreaWidth * index;
          return;
        }

        if (offset > 0) {
          // 下一首
          this.nextVoice();
        } else if (offset < 0) {
          // 上一首
          this.preVoice();
        }
      }
    },

    /** 播放或加入播放列表时，播放器动画 */
    animation(type) {
      if (!this.show && !type) this.show = true;
      if (this.closeTimer) this.clearCloseTimer()
      if (this.show) {
        this.closeTimer = setTimeout(() => {
          if (!this.playListPopupShow && !this.volumePopupShow) this.show = false;
          this.closeTimer = null;
        }, 3000);
      }
    },

    /** 清除自动隐藏计时器 */
    clearCloseTimer() {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/player";
</style>
