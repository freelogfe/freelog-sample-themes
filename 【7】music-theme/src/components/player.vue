<!-- 播放器 -->
<template>
  <div class="player-wrapper">
    <audio
      ref="player"
      :src="store.initUrl ? store.initUrl : playingInfo ? playingInfo.url : ''"
      @loadedmetadata="loadedVoice()"
      @timeupdate="store.initUrl === null && audioPlayUpdate()"
      @ended="store.initUrl === null && endVoice()"
      @error="store.initUrl === null && playError($event)"
      @durationchange="handleDurationChange"
    />

    <!-- mobile -->
    <div class="mobile-player-wrapper" v-if="store.inMobile">
      <div
        class="player"
        :class="{ show: playerShow }"
        @click="
          () => {
            if (playingInfo) {
              playDialogShow = true;
            }
          }
        "
      >
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
              <div class="title voice-title">
                {{ item.exhibitTitle }}
              </div>
            </div>
          </div>
          <div class="no-data-title" v-else>暂无播放的声音</div>
        </div>
        <div class="btns-area">
          <div class="play-btn-area" @click.stop="playOrPause()">
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
          <i class="freelog fl-icon-xiaoshuomulu1" @click.stop="openPlayList()"></i>
        </div>
        <div class="progress-box" @touchstart="slidingProgress = true">
          <el-slider
            class="progress"
            :class="{ 'no-voice': !playingInfo }"
            v-model="store.progress"
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
          <div
            class="clear-btn"
            @click="confirmDialogShow = true"
            v-if="playList && playList?.length"
          >
            清空列表
          </div>
        </div>
        <div class="voice-list" v-if="playList">
          <template v-if="playList.length">
            <div
              class="voice-item"
              v-for="item in playList"
              :key="item.exhibitId"
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
                  <div class="voice-title">{{ item.exhibitTitle }}</div>
                </div>

                <div class="duration-area">
                  <play-status
                    :playing="playing"
                    :desc="`${secondsToHMS(store.progress * 1000)} / ${secondsToHMS(
                      item.versionInfo.exhibitProperty.duration
                    )}`"
                    v-if="
                      playingInfo &&
                      `${playingInfo.exhibitId}${playingInfo?.itemId ?? ''}` ===
                        `${item.exhibitId}${item?.itemId ?? ''}`
                    "
                  />
                  <div class="duration" v-else>
                    {{ secondsToHMS(item.versionInfo.exhibitProperty.duration) }}
                  </div>
                </div>
              </div>

              <div class="delete-btn" @click.stop="deleteVoice(item.exhibitId, item.itemId)">
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

      <div class="mobile-play-dialog" :class="{ show: playDialogShow }" v-if="playDialogShow">
        <div class="drop-arrow" @click="playDialogShow = false">
          <img :src="DropArrow" />
        </div>

        <!-- 封面 -->
        <div class="cover">
          <img :src="playingInfo?.coverImages[0]" alt="封面" />
        </div>

        <!-- 详细信息 -->
        <div class="info-area">
          <div class="title">
            {{ playingInfo.exhibitTitle }}
          </div>
          <div class="desc">
            {{ playingInfo.exhibitIntro }}
          </div>
          <div
            class="type"
            :class="playingInfo.albumName && 'album'"
            @click="
              () => {
                playDialogShow = false;
                playingInfo.albumName &&
                  $router.myPush({ path: '/detail', query: { id: playingInfo.exhibitId } });
              }
            "
          >
            {{ playingInfo.albumName || "单曲" }}
          </div>
        </div>

        <!-- 上一首 | 播放，暂停 | 下一首 -->
        <div class="pre-play-next-area">
          <i
            class="freelog"
            :class="{ [item.icon]: true, disabled: item.disabled }"
            v-for="item in leftBtnList"
            :key="item.icon"
            @click="item.operate"
          />
        </div>

        <!-- 按钮 -->
        <div class="btns-area">
          <i
            :ref="item.name"
            class="freelog"
            :class="item.icon"
            v-for="item in mobileBtnList"
            :key="item.icon"
            @click="item.operate"
          />
        </div>
      </div>
    </div>

    <!-- PC -->
    <template v-if="store.inMobile === false">
      <transition name="slide-up-fade">
        <div
          class="pc-player-wrapper"
          @mouseover="clearCloseTimer()"
          @mouseout="animation()"
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
                <img
                  class="cover"
                  :src="playingInfo.coverImages && playingInfo.coverImages[0]"
                  v-if="playingInfo"
                />
                <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
              </div>
              <div class="info-area">
                <div class="top-area">
                  <template v-if="playingInfo">
                    <div class="title-area">
                      <!-- 音乐标题 -->
                      <my-tooltip :content="playingInfo?.itemTitle || playingInfo.exhibitTitle">
                        <span
                          class="title voice-title"
                          @click="
                            playingInfo?.itemTitle
                              ? $router.myPush({
                                  path: '/detail',
                                  query: {
                                    id: playingInfo.exhibitId,
                                    subID: playingInfo.itemId,
                                    albumName: playingInfo.exhibitTitle
                                  }
                                })
                              : $router.myPush({
                                  path: '/detail',
                                  query: { id: playingInfo.exhibitId }
                                })
                          "
                        >
                          {{ playingInfo?.itemTitle || playingInfo.exhibitTitle }}
                        </span>
                      </my-tooltip>

                      <!-- 合集标题 -->
                      <my-tooltip :content="playingInfo?.albumName" v-if="playingInfo.itemId">
                        <span
                          class="title album-title"
                          @click="
                            $router.myPush({
                              path: '/detail',
                              query: { id: playingInfo.exhibitId }
                            })
                          "
                        >
                          {{ playingInfo.albumName }}
                        </span>
                      </my-tooltip>
                    </div>

                    <div class="progress-area">
                      {{ secondsToHMS(store.progress * 1000) }} /
                      {{ secondsToHMS(playingInfo.versionInfo.exhibitProperty.duration) }}
                      <!-- {{ secondsToHMS(realDuration * 1000) }} -->
                    </div>
                  </template>
                  <span class="no-data-title" v-else>暂无播放的声音</span>
                </div>
                <div @mousedown="slidingProgress = true">
                  <el-slider
                    class="progress"
                    :class="{ 'no-voice': !playingInfo }"
                    v-model="store.progress"
                    :min="0"
                    :max="playingInfo && playingInfo.versionInfo.exhibitProperty.duration / 1000"
                    :format-tooltip="() => secondsToHMS(store.progress * 1000)"
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
              <div class="text-btn clear-btn" @click="clearPlayList()" v-if="playList?.length">
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
                v-for="item in playList"
                :key="item.exhibitId"
                @click="playOrPauseList(item)"
              >
                <div class="left-area">
                  <!-- <img
                    class="icon"
                    src="../assets/images/auth-link-abnormal.png"
                    v-if="![0, 4].includes(item.defaulterIdentityType)"
                  />
                  <i
                    class="freelog fl-icon-suoding lock"
                    @click.stop="getAuth(item)"
                    v-if="item.defaulterIdentityType >= 4"
                  ></i> -->
                  <div class="title-area">
                    <div class="icon-lock-title-wrapper">
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
                      <my-tooltip :content="item.itemTitle || item.exhibitTitle">
                        <span class="title voice-title">{{
                          item.itemTitle || item.exhibitTitle
                        }}</span>
                      </my-tooltip>
                    </div>
                    <span class="album album-title" v-if="item.itemId">{{ item.albumName }}</span>
                  </div>
                </div>

                <div class="right-area">
                  <play-status
                    :playing="playing"
                    :desc="`${secondsToHMS(store.progress * 1000)} / ${secondsToHMS(
                      playingInfo.versionInfo.exhibitProperty.duration
                    )}`"
                    v-if="
                      playingInfo &&
                      `${playingInfo.exhibitId}${playingInfo.itemId ?? ''}` ===
                        `${item.exhibitId}${item.itemId ?? ''}`
                    "
                  />
                  <div class="duration" v-else>
                    {{ secondsToHMS(item.versionInfo?.exhibitProperty.duration) }}
                  </div>
                  <i
                    class="text-btn freelog fl-icon-guanbi"
                    @click.stop="deleteVoice(item.exhibitId, item.itemId)"
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
import { freelogApp } from "freelog-runtime";
import playStatus from "@/components/play-status.vue";
import myTooltip from "@/components/tooltip.vue";
import { useMyAuth, useMyPlay, useMyCollection } from "@/utils/hooks";
import { secondsToHMS, showToast } from "@/utils/common";
import { useGlobalStore } from "@/store/global";

import DropArrow from "@/assets/images/arrow.png";

export default {
  name: "my-player",

  components: {
    playStatus,
    myTooltip
  },

  data() {
    const store = useGlobalStore();

    return {
      DropArrow,
      playList: null,
      show: false,
      volumePopupShow: false,
      volume: null,
      playerShow: true,
      playListPopupShow: false,
      confirmDialogShow: false,
      playDialogShow: false,
      playingInfo: null,
      slidingProgress: false,
      timeout: null,
      infoAreaWidth: 0,
      startTouchX: 0,
      touchMoveX: 0,
      closeTimer: null,
      modes: ["NORMAL", "RANDOM"], // 播放模式列表
      currentModeIndex: 0, // 当前模式索引
      currentRandomIndex: 0, // 当前随机播放索引
      shuffledList: [], // 随机播放列表
      store
      // realDuration: ""
    };
  },

  watch: {
    "store.playMode": {
      handler(cur) {
        this.currentModeIndex = this.modes.findIndex(f => f === cur);
        if (cur === "RANDOM") {
          this.shuffledList = this.playList?.slice();
          this.shuffleArray(this.shuffledList);
          this.currentRandomIndex = 0;
        }
      }
    },
    "store.playList": {
      handler(cur, pre) {
        this.playList = cur;
        if (this.currentPlayMode === "RANDOM" && this.playList?.length) {
          this.shuffledList = this.playList.slice();
          this.shuffleArray(this.shuffledList);
          this.currentRandomIndex = 0;
        }
        // 加入播放列表，显示播放器动画
        if (cur && pre && cur.length - pre.length === 1) this.animation();
        if (!cur || !this.store.inMobile) return;

        if (!this.infoAreaWidth) {
          this.infoAreaWidth = this.$refs.infoArea?.clientWidth;
        }

        if (this.playingInfo) {
          const index = cur.findIndex(item => item.exhibitId === this.playingInfo.exhibitId);
          this.touchMoveX = -this.infoAreaWidth * index;
        }
      },
      // immediate: true,
      deep: true
    },

    "store.playingInfo": {
      handler(cur) {
        console.log("cur", cur);

        this.store.setData({ key: "progress", value: 0 });
        this.playingInfo = cur;

        if (this.playList && this.store.inMobile) {
          const index = this.playList.findIndex(
            item => item.exhibitId === this.playingInfo.exhibitId
          );
          this.touchMoveX = -this.infoAreaWidth * index;
        }
      },
      deep: true
    },

    "store.playing"(cur) {
      if (!this.store.playingInfo) return;

      if (cur) {
        this.playVoice();
      } else {
        this.$refs.player.pause();
      }
    },

    "store.initUrl"(cur) {
      if (cur) {
        this.$refs.player.volume = 0;
      } else {
        this.$refs.player.volume = this.volume / 100;
      }
    },

    "store.inMobile"(cur) {
      const appElement = document.getElementById("app");
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
    /** 当前模式 */
    currentPlayMode() {
      return this.modes[this.currentModeIndex];
    },

    /** 是否收藏 */
    isCollected() {
      const { collectionIdList, playingInfo } = this.store;
      return useMyCollection.ifExist({
        exhibitId: playingInfo?.exhibitId,
        itemId: playingInfo?.itemId
      });
    },

    /** 是否播放中 */
    playing() {
      return this.store?.playing;
    },

    /** 播放进度 */
    percentage() {
      if (this.playingInfo) {
        const duration = this.playingInfo.versionInfo.exhibitProperty.duration;
        if (duration) {
          const progress = ((this.store.progress * 1000) / duration) * 100;
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
          disabled: this.store.playList?.length <= 1
        },
        {
          icon: this.playing ? "fl-icon-zanting-daibiankuang" : "fl-icon-bofang-daibiankuang",
          operate: this.playOrPause
        },
        {
          icon: "fl-icon-xiayishou1",
          operate: this.nextVoice,
          disabled: this.store.playList?.length <= 1
        }
      ];
    },
    /** 右区域按钮群 */
    rightBtnList() {
      return [
        {
          name: "mode",
          icon: this.currentPlayMode === "NORMAL" ? "fl-icon-shunxubofang" : "fl-icon-suijibofang1",
          operate: () => {
            this.changePlayMode();
          }
        },
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
    },

    /** 移动端，播放器区域按钮 */
    mobileBtnList() {
      return [
        {
          name: "mode",
          icon: this.currentPlayMode === "NORMAL" ? "fl-icon-shunxubofang" : "fl-icon-suijibofang1",
          operate: () => {
            this.changePlayMode();
          }
        },
        {
          name: "collect",
          icon: this.isCollected
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          operate: this.operateCollect
        },
        { name: "showBtn", icon: "fl-icon-fenxiang", operate: this.share },
        {
          name: "playList",
          icon: "fl-icon-xiaoshuomulu1",
          operate: () => {
            this.playListPopupShow = !this.playListPopupShow;
          }
        }
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
    /** 更换播放模式 */
    changePlayMode() {
      this.currentModeIndex = (this.currentModeIndex + 1) % this.modes.length;
      const mode = this.modes[this.currentModeIndex];
      this.store.setData({ key: "playMode", value: mode });
      freelogApp.setUserData("playMode", mode);
    },

    shuffleArray(array) {
      for (let i = array?.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
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
    preVoice(data) {
      if (this.currentPlayMode === "NORMAL") {
        useMyPlay.preVoice();
      } else {
        this.currentRandomIndex = this.currentRandomIndex - 1;
        // 重置当前随机播放索引
        if (this.currentRandomIndex < 0) {
          this.currentRandomIndex = this.shuffledList.length - 1;
        }
        useMyPlay.preVoice(this.shuffledList[this.currentRandomIndex]);
      }
    },

    /** 下一首 */
    nextVoice(data, type) {
      if (this.currentPlayMode === "NORMAL") {
        useMyPlay.nextVoice();
      } else {
        if (type === "AUTO") {
          useMyPlay.nextVoice(data);
        } else {
          this.currentRandomIndex = this.currentRandomIndex + 1;
          // 重置当前随机播放索引
          if (this.currentRandomIndex >= this.shuffledList.length) {
            this.currentRandomIndex = 0;
          }
          useMyPlay.nextVoice(this.shuffledList[this.currentRandomIndex]);
        }
      }
    },

    /** 播放完成 */
    async endVoice() {
      if (this.playList.length === 1) {
        await this.store.setData({ key: "playing", value: false });
        await this.store.setData({ key: "progress", value: 0 });
        await this.store.setData({ key: "playingInfo", value: null });

        return;
      }

      if (this.currentPlayMode === "NORMAL") {
        const { playList, playingInfo, playIdList } = this.store;

        // 判断当前播放音乐是否是播放列表中的最后一个
        const currentIndex = playList.findIndex(
          item =>
            item.exhibitId === playingInfo.exhibitId &&
            (item.itemId ?? "") === (playingInfo.itemId ?? "")
        );

        const isFinalMusic = currentIndex === playIdList.length - 1;

        if (isFinalMusic) {
          await this.store.setData({ key: "playing", value: false });
          await this.store.setData({ key: "progress", value: 0 });
          await this.store.setData({ key: "playingInfo", value: null });
          return;
        }

        this.nextVoice();
      } else {
        this.currentRandomIndex = this.currentRandomIndex + 1;
        // 重置当前随机播放索引
        if (this.currentRandomIndex >= this.shuffledList.length) {
          this.currentRandomIndex = 0;
        }
        this.nextVoice(this.shuffledList[this.currentRandomIndex], "AUTO");
      }
    },

    /** 播放失败 */
    playError() {
      if (!this.playing) return;

      const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
      if (!supportMimeList.includes(this.playingInfo?.versionInfo.exhibitProperty.mime)) {
        showToast("无法播放");
        return;
      }

      if (this.playingInfo?.articleInfo.status === 2) {
        this.nextVoice();
        showToast("已封禁，无法播放");
        return;
      }
      showToast("当前浏览器无法播放，请更换浏览器重试");
    },

    /** 播放/暂停 */
    playOrPause() {
      if (this.playingInfo) {
        useMyPlay.playOrPause(this.playingInfo);
      } else {
        useMyPlay.playOrPause(this.playList[0]);
      }
    },

    // 收藏/取消收藏
    async operateCollect() {
      useMyCollection.operateCollect(this.playingInfo);
    },

    /** 分享 */
    share() {
      if (this.store.inMobile) {
        const copiedShareHref = `${window.location.origin}/detail?id=${this.playingInfo.exhibitId}`;
        navigator.clipboard
          .writeText(copiedShareHref)
          .then(() => {
            console.log("来到这里了");
            showToast("链接复制成功～");
          })
          .catch(error => {
            console.log("报错");
            const input = document.createElement("input");
            document.body.appendChild(input);
            input.setAttribute("value", copiedShareHref);
            input.select();
            if (document.execCommand("copy")) {
              document.execCommand("copy");
            }
            document.body.removeChild(input);
            showToast("链接复制成功～");
          });
      } else {
        this.store.setData({ key: "shareInfo", value: { show: true, exhibit: this.voiceInfo } });
      }
    },

    /** 播放/暂停播放列表 */
    playOrPauseList(data) {
      useMyPlay.playOrPause(data);
    },

    /** 移出播放列表 */
    deleteVoice(id, itemId) {
      useMyPlay.removeFromPlayList(id, itemId);
    },

    /** 清空播放列表 */
    clearPlayList() {
      useMyPlay.clearPlayList();
      this.confirmDialogShow = false;
      this.$refs.player.currentTime = 0;
    },

    /** 授权 */
    async getAuth(data) {
      useMyAuth.getAuth(data);
    },

    /** 监听点击区域 */
    clickListener() {
      const app = document.getElementById("app");

      document.addEventListener("click", e => {
        if (!this.show || this.store.inMobile) return;

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

    // handleDurationChange(e) {
    //   const newDuration = e.target.duration;
    //   this.realDuration = newDuration;
    // },

    /** 播放声音 */
    playVoice() {
      if (!this.playing) return;

      this.$refs.player.play();
      // const { isIOS } = this.$store.state;
      // if (isIOS) {
      //   // ios 设备第一次播放音频会失败，需要重新播放一次才会正常
      //   this.$nextTick(() => {
      //     this.$refs.player.pause();
      //     this.$refs.player.play();
      //   });
      // }
      // 播放音频，显示播放器动画
      this.animation();
    },

    /** 音频播放时间变化 */
    audioPlayUpdate() {
      if (this.slidingProgress || !this.store.playing) return;

      const progress = this.$refs.player.currentTime;
      this.store.setData({ key: "progress", value: progress });
    },

    /** 改变音频进度 */
    changeProgress(e) {
      if (!this.playingInfo || isNaN(e)) {
        return;
      }
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
          item => item.exhibitId === this.playingInfo.exhibitId
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
          item => item.exhibitId === this.playingInfo.exhibitId
        );
        const basicX = -this.infoAreaWidth * index;
        console.log("this.$refs", this.$refs);
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
    animation() {
      // if (!this.show) this.show = true;
      if (this.closeTimer) this.clearCloseTimer();
      this.closeTimer = setTimeout(() => {
        if (!this.playListPopupShow && !this.volumePopupShow) this.show = false;
        this.closeTimer = null;
      }, 3000);
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

<style lang="less" scoped>
@import "@/assets/css/player.less";
</style>
