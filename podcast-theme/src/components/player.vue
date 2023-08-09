<!-- 播放器 -->

<template>
  <div class="player-wrapper">
    <audio
      ref="player"
      :src="playingInfo ? playingInfo.url : ''"
      @canplay="canplay()"
      @timeupdate="audioPlayUpdate()"
      @ended="nextVoice()"
      @error="playError($event)"
    />

    <!-- mobile -->
    <div class="mobile-player-wrapper" v-if="$store.state.inMobile">
      <div class="player" :class="{ show: playerShow }">
        <div class="cover-area">
          <img class="cover" :src="playingInfo.coverImages[0]" v-if="playingInfo" />
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
              :key="item.exhibitId"
            >
              <div
                class="title voice-title"
                @click="$router.myPush({ path: '/voice-detail', query: { id: item.exhibitId } })"
              >
                {{ item.exhibitTitle }}
              </div>
            </div>
          </div>
          <div class="no-data-title" v-else>暂无播放的声音</div>
        </div>
        <div class="btns-area">
          <div class="play-btn-area" @click="playOrPause()">
            <i
              class="freelog play"
              :class="playing ? 'fl-icon-zanting-daibiankuang' : 'fl-icon-bofang-daibiankuang'"
            ></i>
            <el-progress
              class="progress"
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
        <div @touchstart="slidingProgress = true">
          <el-slider
            class="progress"
            :class="{ 'no-voice': !playingInfo }"
            v-model="$store.state.progress"
            :min="0"
            :max="playingInfo && playingInfo.versionInfo.exhibitProperty.duration / 1000"
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
          <div class="clear-btn" @click="confirmDialogShow = true" v-if="playList && playList.length">清空列表</div>
        </div>
        <div class="voice-list" v-if="playList">
          <template v-if="playList.length">
            <div class="voice-item" v-for="item in playList" :key="item.exhibitId" @click="playOrPauseList(item)">
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
                  <div class="voice-title">{{ item.exhibitTitle }}</div>
                </div>

                <div class="duration-area">
                  <play-status
                    :playing="playing"
                    :desc="`${secondsToHMS($store.state.progress * 1000)} / ${secondsToHMS(
                      item.versionInfo.exhibitProperty.duration
                    )}`"
                    v-if="playingInfo && playingInfo.exhibitId === item.exhibitId"
                  />
                  <div class="duration" v-else>
                    {{ item.versionInfo.exhibitProperty.duration | secondsToHMS }}
                  </div>
                </div>
              </div>

              <div class="delete-btn" @click.stop="deleteVoice(item.exhibitId)">
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
        <div class="pc-player-wrapper" v-if="show">
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
                <img class="cover" :src="playingInfo.coverImages[0]" v-if="playingInfo" />
                <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
              </div>
              <div class="info-area">
                <div class="top-area">
                  <template v-if="playingInfo">
                    <div class="title-area">
                      <my-tooltip class="title voice-title" :content="playingInfo.exhibitTitle">
                        <span @click="$router.myPush({ path: '/voice-detail', query: { id: playingInfo.exhibitId } })">
                          {{ playingInfo.exhibitTitle }}
                        </span>
                      </my-tooltip>
                    </div>
                    <div class="progress-area">
                      {{ ($store.state.progress * 1000) | secondsToHMS }} /
                      {{ playingInfo.versionInfo.exhibitProperty.duration | secondsToHMS }}
                    </div>
                  </template>
                  <span class="no-data-title" v-else>暂无播放的声音</span>
                </div>
                <div @mousedown="slidingProgress = true">
                  <el-slider
                    class="progress"
                    :class="{ 'no-voice': !playingInfo }"
                    v-model="$store.state.progress"
                    :min="0"
                    :max="playingInfo && playingInfo.versionInfo.exhibitProperty.duration / 1000"
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
              <div class="text-btn clear-btn" @click="clearPlayList()" v-if="playList.length">清空列表</div>
              <i class="text-btn freelog fl-icon-zhankaigengduo" @click="playListPopupShow = false"></i>
            </div>
          </div>
          <div class="voice-list" v-if="playList">
            <template v-if="playList.length">
              <div class="voice-item" v-for="item in playList" :key="item.exhibitId" @click="playOrPauseList(item)">
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
                    <my-tooltip class="title voice-title" :content="item.exhibitTitle">
                      <span>{{ item.exhibitTitle }}</span>
                    </my-tooltip>
                  </div>
                </div>

                <div class="right-area">
                  <play-status
                    :playing="playing"
                    :desc="`${secondsToHMS($store.state.progress * 1000)} / ${secondsToHMS(
                      item.versionInfo.exhibitProperty.duration
                    )}`"
                    v-if="playingInfo && playingInfo.exhibitId === item.exhibitId"
                  />
                  <div class="duration" v-else>
                    {{ item.versionInfo.exhibitProperty.duration | secondsToHMS }}
                  </div>
                  <i class="text-btn freelog fl-icon-guanbi" @click.stop="deleteVoice(item.exhibitId)"></i>
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
    myTooltip,
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
    };
  },

  watch: {
    "$store.state.playList": {
      handler(cur, pre) {
        this.playList = cur;
        // 加入播放列表，显示播放器动画
        if (cur && pre && cur.length - pre.length === 1) this.animation();
        if (!cur || !this.$store.state.inMobile) return;

        if (this.playingInfo) {
          const index = cur.findIndex((item) => item.exhibitId === this.playingInfo.exhibitId);
          this.touchMoveX = -this.infoAreaWidth * index;
        }
        if (!this.infoAreaWidth) {
          this.$nextTick(() => {
            this.infoAreaWidth = this.$refs.infoArea.clientWidth;
          });
        }
      },
      immediate: true,
    },

    "$store.state.playingInfo": {
      handler(cur) {
        this.$store.commit("setData", { key: "progress", value: 0 });
        this.playingInfo = cur;

        if (this.playList && this.$store.state.inMobile) {
          const index = this.playList.findIndex((item) => item.exhibitId === this.playingInfo.exhibitId);
          this.touchMoveX = -this.infoAreaWidth * index;
        }
      },
      deep: true,
    },

    "$store.state.playing"(cur) {
      if (!this.$store.state.playingInfo) return;

      if (cur) {
        this.$refs.player.play();
        const { isIOS } = this.$store.state;
        if (isIOS) {
          // ios 设备第一次播放音频会失败，需要重新播放一次才会正常
          this.$nextTick(() => {
            this.$refs.player.pause();
            this.$refs.player.play();
          });
        }
        // 播放音频，显示播放器动画
        this.animation();
      } else {
        this.$refs.player.pause();
      }
    },

    "$store.state.inMobile"(cur) {
      if (cur) {
        app.addEventListener("touchend", () => {
          this.slidingProgress = false;
        });
      } else {
        app.addEventListener("mouseup", () => {
          this.slidingProgress = false;
        });
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

    /** 是否播放中 */
    playing() {
      return this.$store.state.playing;
    },

    /** 播放进度 */
    percentage() {
      if (this.playingInfo) {
        const duration = this.playingInfo.versionInfo.exhibitProperty.duration;
        if (duration) {
          return ((this.$store.state.progress * 1000) / duration) * 100;
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
        { icon: "fl-icon-shangyishou1", operate: this.preVoice, disabled: this.$store.state.playList.length <= 1 },
        {
          icon: this.playing ? "fl-icon-zanting-daibiankuang" : "fl-icon-bofang-daibiankuang",
          operate: this.playOrPause,
        },
        { icon: "fl-icon-xiayishou1", operate: this.nextVoice, disabled: this.$store.state.playList.length <= 1 },
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

    /** 播放失败 */
    playError() {
      if (!this.playing) return;

      showToast("当前浏览器无法播放，请更换浏览器重试");
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
    deleteVoice(id) {
      useMyPlay.removeFromPlayList(id);
    },

    /** 清空播放列表 */
    clearPlayList() {
      useMyPlay.clearPlayList();
      this.confirmDialogShow = false;
    },

    /** 授权 */
    async getAuth(data) {
      useMyAuth.getAuth(data);
    },

    /** 监听点击区域 */
    clickListener() {
      document.addEventListener("click", (e) => {
        if (!this.show || this.$store.state.inMobile) return;

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
      if (this.playing) this.$refs.player.play();
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
      this.startTouchX = e.changedTouches[0].clientX;
    },

    /** 划动声音 */
    touchMove(e) {
      const index = this.playList.findIndex((item) => item.exhibitId === this.playingInfo.exhibitId);
      const basicX = -this.infoAreaWidth * index;
      const offset = e.changedTouches[0].clientX - this.startTouchX;
      this.touchMoveX = basicX + offset;
    },

    /** 结束划动声音 */
    touchEnd() {
      const index = this.playList.findIndex((item) => item.exhibitId === this.playingInfo.exhibitId);
      const basicX = -this.infoAreaWidth * index;
      const areaWidth = this.$refs.infoArea.clientWidth;
      const offset = basicX - this.touchMoveX;
      if (Math.abs(offset) < (areaWidth * 2) / 3) {
        // 不切
        this.touchMoveX = -this.infoAreaWidth * index;
        return;
      }

      if (offset > 0) {
        // 下一首
        useMyPlay.nextVoice();
      } else if (offset < 0) {
        // 上一首
        useMyPlay.preVoice();
      }
    },

    /** 播放或加入播放列表时，播放器动画 */
    animation() {
      if (this.show) return;

      this.show = true;
      setTimeout(() => {
        if (!this.playListPopupShow && !this.volumePopupShow) this.show = false;
      }, 3000);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/player";
</style>
