<!-- 播放器 v2 -->
<template>
  <div class="player-v2-wrapper player-wrapper">
    <audio
      ref="player"
      :src="store.initUrl ? store.initUrl : playingInfo ? playingInfo.url : ''"
      @loadedmetadata="onPlayerMetadata"
      @timeupdate="store.initUrl === null && audioPlayUpdate()"
      @ended="store.initUrl === null && endVoice()"
      @error="store.initUrl === null && playError($event)"
      @durationchange="handleDurationChange"
      @pause="handlePause"
      @play="handlePlay"
    />

    <!-- mobile -->
    <div class="mobile-player-wrapper" v-if="store.inMobile">
      <div
        class="player"
        :class="{ show: playerShow }"
        @click.stop="
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
                {{ playingInfo.itemTitle || playingInfo.exhibitTitle }}
              </div>

              <div class="singer" v-if="playingArtist">
                {{ playingArtist }}
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
              class="circle-progress"
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
        <div class="progress-box" @touchstart="slidingProgress = true" @click.stop>
          <el-slider
            class="progress"
            :class="{ 'no-voice': !playingInfo }"
            v-model="store.progress"
            :min="0"
            :max="progressMax"
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
            v-if="playList && playList?.length && !store.playListLoading"
          >
            清空列表
          </div>
        </div>
        <div class="voice-list" v-if="!store.playListLoading && playList">
          <template v-if="playList.length">
            <div
              class="voice-item"
              :class="{
                'opacity-40':
                  ![0, 4].includes(item.defaulterIdentityType) ||
                  item.onlineStatus === 0 ||
                  item?.articleInfo?.status === 2
              }"
              v-for="item in playList"
              :key="`${item.exhibitId}-${item.itemId || ''}`"
              @click="playOrPauseList(item)"
            >
              <div class="left-area">
                <div class="title-area">
                  <img
                    class="icon"
                    src="../assets/images/freeze.png"
                    v-if="item.articleInfo?.status === 2"
                    alt="封禁"
                  />
                  <div v-else-if="item.onlineStatus === 0" class="offline-lock">已下架</div>

                  <img
                    class="icon"
                    src="../assets/images/auth-link-abnormal.png"
                    alt="授权链异常"
                    v-else-if="![0, 4].includes(item.defaulterIdentityType)"
                  />
                  <i
                    class="freelog fl-icon-suoding lock"
                    @click.stop="getAuth(item)"
                    alt="未授权"
                    v-else-if="item.defaulterIdentityType >= 4"
                  ></i>
                  <div class="voice-title">{{ item.itemTitle || item.exhibitTitle }}</div>
                </div>

                <div class="duration-area">
                  <play-status
                    :playing="playing"
                    :status-text="false"
                    color="var(--sy-brand)"
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
          <div class="no-data-tip" v-else>暂无任何音乐</div>
        </div>
        <el-skeleton
          class="skeleton"
          :rows="8"
          animated
          v-if="store.playListLoading || !playList"
        />
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
          <div class="desc" v-if="playingArtist">
            {{ playingArtist }}
          </div>
          <div
            class="type"
            :class="playingInfo.albumName && 'album'"
            @click="
              () => {
                playDialogShow = false;
                playingInfo.albumName &&
                  $router.myPush({
                    path: '/detail',
                    query: { id: playingInfo.exhibitId }
                  });
              }
            "
          >
            {{ getItemAlbum(playingInfo) }}
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

        <div v-if="podcastPlayback" class="mobile-podcast-controls">
          <button type="button" aria-label="后退15秒" @click="skipPodcast(-15)">后退15秒</button>
          <PodcastRate v-model="podcastRate" />
          <button type="button" aria-label="前进15秒" @click="skipPodcast(15)">前进15秒</button>
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
    <div
      class="pc-player-v2-dock"
      v-if="
        store.inMobile === false &&
        store.playerShowStatus &&
        (!store.playerCollapsed || collapseAnimating)
      "
    >
      <transition name="scale">
        <div ref="playListPopup" class="pc-playlist-v2" key="playList" v-if="playListPopupShow">
          <div class="playlist-header">
            <div class="popup-title">播放列表</div>
            <div class="header-actions">
              <button
                type="button"
                class="header-btn clear-btn"
                @click="clearPlayList()"
                v-if="playList?.length && !store.playListLoading"
              >
                <i class="freelog fl-icon-icon_clear" />
                清空
              </button>
              <button
                type="button"
                class="header-btn collapse-btn-header"
                @click="playListPopupShow = false"
              >
                <i class="freelog fl-icon-icon_back" />
                收起
              </button>
            </div>
          </div>
          <div
            class="playlist-body"
            :class="{ 'is-empty': !playList.length }"
            v-if="!store.playListLoading && playList"
          >
            <template v-if="playList.length">
              <div
                class="playlist-row"
                :class="{
                  'is-playing': isPlayingItem(item),
                  'opacity-40':
                    ![0, 4].includes(item.defaulterIdentityType) ||
                    item.onlineStatus === 0 ||
                    item?.articleInfo?.status === 2
                }"
                v-for="item in playList"
                :key="`${item.exhibitId}-${item.itemId || ''}`"
                @click="playOrPauseList(item)"
              >
                <div class="col-title">
                  <img
                    class="icon"
                    src="../assets/images/freeze.png"
                    v-if="item.articleInfo?.status === 2"
                    alt="封禁"
                    @click.stop
                  />
                  <div v-else-if="item.onlineStatus === 0" class="offline-lock" @click.stop>
                    已下架
                  </div>
                  <img
                    class="icon"
                    src="../assets/images/auth-link-abnormal.png"
                    alt="授权链异常"
                    v-else-if="![0, 4].includes(item.defaulterIdentityType)"
                    @click.stop
                  />
                  <i
                    class="freelog fl-icon-suoding lock"
                    @click.stop="getAuth(item)"
                    alt="未授权"
                    v-else-if="item.defaulterIdentityType >= 4"
                  ></i>
                  <my-tooltip :content="item.itemTitle || item.exhibitTitle">
                    <span class="title-text voice-title" @click.stop="goToItemDetail(item)">{{
                      item.itemTitle || item.exhibitTitle
                    }}</span>
                  </my-tooltip>
                </div>
                <div class="col-artist">
                  <span class="col-text" @click.stop>{{ getItemArtist(item) || "未知" }}</span>
                </div>
                <div class="col-album">
                  <span
                    class="col-text"
                    :class="{ 'album-link': item.albumName }"
                    @click.stop="goToItemAlbum(item)"
                    >{{ getItemAlbum(item) }}</span
                  >
                </div>
                <div class="col-duration">
                  <div class="col-text" @click.stop v-if="isPlayingItem(item)">
                    <play-status
                      :playing="playing"
                      :status-text="false"
                      color="var(--sy-brand)"
                    />
                  </div>
                  <span class="col-text" @click.stop v-else>{{
                    secondsToHMS(item.versionInfo?.exhibitProperty?.duration)
                  }}</span>
                </div>
                <button
                  type="button"
                  class="col-delete"
                  @click.stop="deleteVoice(item.exhibitId, item.itemId)"
                >
                  <i class="freelog fl-icon-guanbi" />
                </button>
              </div>
            </template>
            <div class="no-data-tip" v-else>暂无任何音乐</div>
          </div>
          <player-playlist-skeleton v-if="store.playListLoading || !playList" />
        </div>
      </transition>

      <div
        ref="expandedPlayer"
        class="pc-player-v2"
        :class="{ 'is-collapsing': collapseAnimating, 'is-podcast': podcastPlayback }"
      >
        <div class="pc-player-v2-inner expanded-player-layout" :class="{ 'podcast-player-layout': podcastPlayback }">
          <div class="track-area">
            <div class="cover-area" :class="{ 'is-empty': !playingInfo }">
              <img
                class="cover"
                :src="playingInfo.coverImages && playingInfo.coverImages[0]"
                v-if="playingInfo"
              />
              <img v-else class="expanded-empty-icon" :src="collapsedIcons.empty" width="24" height="24" alt="暂无播放内容" />
            </div>

          </div>

          <div class="controls-area">
            <button
              type="button"
              class="control-btn"
              :class="{ disabled: item.disabled }"
              :disabled="item.disabled"
              :aria-label="item.label"
              v-for="item in leftBtnList"
              :key="item.icon"
              @click="item.operate"
            >
              <i class="freelog" :class="item.icon" />
            </button>
          </div>

          <div v-if="podcastPlayback" class="podcast-seek-controls">
            <button class="control-btn" type="button" aria-label="后退15秒" title="后退15秒" @click="skipPodcast(-15)"><img class="podcast-rewind" :src="podcastSeekIcons.back" alt="" /></button>
            <button class="control-btn" type="button" aria-label="前进15秒" title="前进15秒" @click="skipPodcast(15)"><img class="podcast-forward" :src="podcastSeekIcons.forward" alt="" /></button>
          </div>
          <div class="progress-area">
            <button v-if="playingInfo" class="now-playing-title" :title="playingInfo?.itemTitle || playingInfo?.exhibitTitle" @click="openPlayingDetail">{{ playingInfo?.itemTitle || playingInfo?.exhibitTitle }}</button>
            <span class="time current-time">
              {{ secondsToHMS(store.progress * 1000) }}
            </span>
            <div class="slider-wrap" @mousedown="slidingProgress = true">
              <el-slider
                class="progress"
                :class="{ 'no-voice': !playingInfo }"
                v-model="store.progress"
                :min="0"
                :max="progressMax"
                :format-tooltip="() => secondsToHMS(store.progress * 1000)"
                @change="changeProgress"
              ></el-slider>
            </div>
            <span class="time playback-time-separator">/</span>
            <span class="time total-time" v-if="playingInfo">
              {{ secondsToHMS(playingInfo.versionInfo.exhibitProperty.duration) }}
            </span>
            <span class="time total-time" v-else>00:00</span>
          </div>

          <div class="actions-area">
            <PodcastRate v-if="podcastPlayback" v-model="podcastRate" />
            <template v-for="item in utilityBtnList" :key="item.name">
              <div v-if="item.name === 'volume'" class="volume-wrap">
                <transition name="scale">
                  <div ref="volumePopup" class="pc-volume-popup" v-if="volumePopupShow">
                    <el-slider
                      class="progress"
                      v-model="volume"
                      vertical
                      :min="0"
                      :max="100"
                    ></el-slider>
                  </div>
                </transition>
                <button type="button" class="action-btn" :ref="item.name" @click="item.operate">
                  <i class="freelog" :class="item.icon" />
                </button>
              </div>
              <button
                v-else
                type="button"
                class="action-btn"
                :ref="item.name"
                :aria-label="item.name === 'playList' ? '播放列表' : undefined"
                @click="item.operate"
              >
                <i class="freelog" :class="item.name === 'playList' ? 'fl-icon-xiaoshuomulu' : item.icon" />
              </button>
            </template>
          </div>

          <button type="button" class="collapse-btn" aria-label="收起播放器" @click="startCollapsePlayer">
            <i class="freelog fl-icon-icon_back" />
          </button>
        </div>
      </div>
    </div>

    <transition name="player-collapsed">
      <div
        class="pc-player-v2-collapsed-dock"
        v-if="store.inMobile === false && store.playerShowStatus && store.playerCollapsed"
        @mouseenter="onCollapsedDockEnter"
        @mouseleave="onCollapsedDockLeave"
        @focusin="onCollapsedDockEnter"
        @focusout="onCollapsedDockFocusOut"
      >
        <div class="pc-player-v2-collapsed" :class="{ 'is-expanded': collapsedDockExpanded }">
          <button type="button" class="expand-btn" aria-label="展开播放器" @click="expandPlayer">
            <img :src="collapsedIcons.back" alt="" />
          </button>
          <div class="collapsed-controls">
            <button
              type="button"
              class="control-btn"
              :class="{ disabled: item.disabled }"
              :disabled="item.disabled"
              :aria-label="item.label"
              v-for="item in leftBtnList"
              :key="item.icon"
              @click="item.operate"
            >
              <img v-if="collapsedIcons[item.icon]" :src="collapsedIcons[item.icon]" alt="" />
              <i v-else class="freelog" :class="item.icon" />
            </button>
          </div>
          <button type="button" class="collapsed-cover" aria-label="打开播放器" @click="onCollapsedCoverClick">
            <svg v-if="playingInfo" class="cover-ring" viewBox="0 0 68 68" width="68" height="68" aria-hidden="true">
              <circle cx="34" cy="34" r="32" fill="none" stroke="var(--sy-brand)" stroke-width="4" pathLength="100" :stroke-dasharray="`${Math.min(100, Math.max(0, Number(percentage) || 0))} 100`" transform="rotate(-90 34 34)" />
            </svg>
            <div
              class="cover-spin-wrap"
              :class="{ 'is-spinning': playingInfo, 'is-paused': !playing }"
            >
              <img
                class="cover"
                :src="playingInfo.coverImages && playingInfo.coverImages[0]"
                v-if="playingInfo"
              />
              <img v-else class="collapsed-empty-icon" :src="collapsedIcons.empty" width="24" height="24" alt="" />
            </div>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import playerMixin from "./player.mixin.js";
import { isPodcast, detailLocation } from '@/api/shengyu';
import { applyPodcastRate, seekPodcast } from '@/utils/podcast-playback';
import PodcastRate from './shengyu-podcast-rate.vue';
import rewindSvg from '@/assets/images/shengyu-podcast-rewind.svg?raw';
import forwardSvg from '@/assets/images/shengyu-podcast-forward.svg?raw';
import collapsedEmpty from '@/assets/images/shengyu-player-empty.svg?raw';
import collapsedBack from '@/assets/images/shengyu-player-back.svg?raw';
import collapsedPrev from '@/assets/images/shengyu-player-prev.svg?raw';
import collapsedPause from '@/assets/images/shengyu-player-pause.svg?raw';
import collapsedNext from '@/assets/images/shengyu-player-next.svg?raw';
import playStatus from "@/components/play-status.vue";
import myTooltip from "@/components/tooltip.vue";
import playerPlaylistSkeleton from "@/components/player-playlist-skeleton.vue";

export default {
  name: "player-v2",

  mixins: [playerMixin],

  components: {
    PodcastRate,
    playStatus,
    myTooltip,
    playerPlaylistSkeleton
  },

  data() {
    return {
      podcastRate: 1,
      podcastSeekIcons: { back: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rewindSvg)}`, forward: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(forwardSvg)}` },
      collapsedIcons: Object.fromEntries(Object.entries({ empty: collapsedEmpty, back: collapsedBack, 'fl-icon-shangyiqu': collapsedPrev, 'fl-icon-zanting1': collapsedPause, 'fl-icon-xiayiqu': collapsedNext }).map(([key, svg]) => [key, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`])),
      collapsedDockExpanded: false,
      collapsedExpandTimer: null,
      collapseAnimating: false,
      collapseAnimationTimer: null
    };
  },

  watch: {
    podcastRate() { this.syncPodcastRate(); },
    'store.playingInfo': {
      handler() { this.$nextTick(() => this.syncPodcastRate()); },
      immediate: true
    },
    "store.playerCollapsed"() {
      this.resetCollapsedDockExpand();
    },

    "store.playerShowStatus"(val) {
      if (val && !this.store.playerCollapsed) {
        this.show = true;
      }
    }
  },

  beforeUnmount() {
    this.clearCollapsedExpandTimer();
    this.clearCollapseAnimation();
  },

  computed: {
    podcastPlayback() { return !!this.store.playingInfo && isPodcast(this.store.playingInfo); },
    utilityBtnList() {
      return this.rightBtnList.filter(item => item.name !== "showBtn");
    },

    playingArtist() {
      const info = this.playingInfo;
      if (!info) return "";
      return (
        info?.versionInfo?.exhibitProperty?.display_artist ||
        info?.articleInfo?.articleProperty?.display_artist ||
        ""
      );
    }
  },

  methods: {
    openPlayingDetail() { if (this.playingInfo) this.$router.push(detailLocation(this.playingInfo)); },
    syncPodcastRate() { applyPodcastRate(this.$refs.player, this.podcastPlayback, this.podcastRate); },
    onPlayerMetadata() { this.syncPodcastRate(); this.loadedVoice(); },
    skipPodcast(offset) {
      if (!this.podcastPlayback) return;
      const time = seekPodcast(this.$refs.player, offset);
      if (time !== undefined) this.store.setData({ key: 'progress', value: time });
    },
    clearCollapsedExpandTimer() {
      if (this.collapsedExpandTimer) {
        clearTimeout(this.collapsedExpandTimer);
        this.collapsedExpandTimer = null;
      }
    },

    resetCollapsedDockExpand() {
      this.clearCollapsedExpandTimer();
      this.collapsedDockExpanded = false;
    },

    onCollapsedDockEnter() {
      this.clearCollapsedExpandTimer();
      this.collapsedExpandTimer = setTimeout(() => {
        this.collapsedDockExpanded = true;
        this.collapsedExpandTimer = null;
      }, 0);
    },

    onCollapsedDockLeave() {
      if (this.$el?.querySelector(":focus-visible")) return;
      this.resetCollapsedDockExpand();
    },

    onCollapsedDockFocusOut(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) this.resetCollapsedDockExpand();
    },

    onCollapsedCoverClick() {
      this.expandPlayer();
    },

    clearCollapseAnimation() {
      if (this.collapseAnimationTimer) {
        clearTimeout(this.collapseAnimationTimer);
        this.collapseAnimationTimer = null;
      }
      const playerEl = this.$refs.expandedPlayer;
      if (playerEl) {
        playerEl.removeEventListener("animationend", this.finishCollapsePlayer);
        playerEl.style.removeProperty("--collapse-dx");
        playerEl.style.removeProperty("--collapse-dy");
        playerEl.style.removeProperty("--collapse-scale");
      }
      this.$el?.style?.removeProperty("--collapse-scale");
      this.collapseAnimating = false;
    },

    startCollapsePlayer() {
      if (this.collapseAnimating || this.store.playerCollapsed) return;

      this.volumePopupShow = false;
      this.playListPopupShow = false;

      const playerEl = this.$refs.expandedPlayer;
      if (!playerEl) {
        this.collapsePlayer();
        return;
      }

      const rect = playerEl.getBoundingClientRect();
      const targetCenterX = window.innerWidth - 30 - 39;
      const targetCenterY = window.innerHeight - 30 - 39;

      const collapseScale = String(78 / rect.width);

      playerEl.style.setProperty(
        "--collapse-dx",
        `${targetCenterX - (rect.left + rect.width / 2)}px`
      );
      playerEl.style.setProperty(
        "--collapse-dy",
        `${targetCenterY - (rect.top + rect.height / 2)}px`
      );
      playerEl.style.setProperty("--collapse-scale", collapseScale);
      this.$el?.style?.setProperty("--collapse-scale", collapseScale);

      this.collapseAnimating = true;
      this.collapsePlayer();

      this.$nextTick(() => {
        const animatingEl = this.$refs.expandedPlayer;
        if (!animatingEl) {
          this.finishCollapsePlayer();
          return;
        }

        animatingEl.addEventListener("animationend", this.finishCollapsePlayer);
        this.collapseAnimationTimer = setTimeout(() => {
          this.finishCollapsePlayer();
        }, 500);
      });
    },

    finishCollapsePlayer() {
      if (!this.collapseAnimating) return;

      if (this.collapseAnimationTimer) {
        clearTimeout(this.collapseAnimationTimer);
        this.collapseAnimationTimer = null;
      }

      const playerEl = this.$refs.expandedPlayer;
      if (playerEl) {
        playerEl.removeEventListener("animationend", this.finishCollapsePlayer);
        playerEl.style.removeProperty("--collapse-dx");
        playerEl.style.removeProperty("--collapse-dy");
        playerEl.style.removeProperty("--collapse-scale");
      }
      this.$el?.style?.removeProperty("--collapse-scale");

      this.collapseAnimating = false;
    },

    /** v2：不自动隐藏，仅保证播放器条显示 */
    animation() {
      if (!this.store.playerShowStatus || this.store.playerCollapsed) return;
      this.show = true;
    },

    isPlayingItem(item) {
      if (!this.playingInfo) return false;
      return (
        `${this.playingInfo.exhibitId}${this.playingInfo?.itemId ?? ""}` ===
        `${item.exhibitId}${item?.itemId ?? ""}`
      );
    },

    getItemArtist(item) {
      return (
        item?.versionInfo?.exhibitProperty?.display_artist ||
        item?.articleInfo?.articleProperty?.display_artist ||
        item?.articleInfo?.articleOwnerName ||
        ""
      );
    },

    getItemAlbum(item) {
      return (
        item?.albumName ||
        item?.versionInfo?.exhibitProperty?.album_name ||
        item?.articleInfo?.articleProperty?.album_name ||
        (item && isPodcast(item) ? "单集" : "单曲")
      );
    },

    goToItemAlbum(item) {
      if (!item.albumName) return;
      this.$router.myPush({
        path: "/detail",
        query: { id: item.exhibitId }
      });
    },

    goToItemDetail(item) {
      this.$router.myPush(detailLocation(item));
    }
  }
};
</script>

<style lang="less" scoped>
@import "@/assets/css/player.less";
@import "@/assets/css/player-v2.less";
</style>
