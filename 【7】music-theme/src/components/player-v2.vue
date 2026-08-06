<!-- 播放器 v2 -->
<template>
  <div class="player-v2-wrapper player-wrapper">
    <audio
      ref="player"
      :src="store.initUrl ? store.initUrl : playingInfo ? playingInfo.url : ''"
      @loadedmetadata="loadedVoice()"
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

              <div class="singer" v-if="playingInfo.articleInfo?.articleProperty?.display_artist">
                {{ playingInfo.articleInfo?.articleProperty?.display_artist }}
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
          <div class="desc">
            {{ playingInfo.articleInfo?.articleProperty?.display_artist }}
          </div>
          <div
            class="type"
            :class="playingInfo.albumName && 'album'"
            @click="
              () => {
                playDialogShow = false;
                playingInfo.albumName &&
                  $router.myPush({
                    path: playingInfo.parentArticleType === 3 ? '/play-detail' : '/detail',
                    query: { id: playingInfo.exhibitId }
                  });
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
                      :desc="`${secondsToHMS(store.progress * 1000)} / ${secondsToHMS(
                        item.versionInfo.exhibitProperty.duration
                      )}`"
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
        :class="{ 'is-collapsing': collapseAnimating }"
      >
          <div class="pc-player-v2-inner">
            <div class="track-area">
              <div class="cover-area">
                <img
                  class="cover"
                  :src="playingInfo.coverImages && playingInfo.coverImages[0]"
                  v-if="playingInfo"
                />
                <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
              </div>
              <div class="meta-area">
                <template v-if="playingInfo">
                  <my-tooltip :content="playingInfo?.itemTitle || playingInfo.exhibitTitle">
                    <span
                      class="song-title voice-title"
                      @click="
                        playingInfo?.itemTitle
                          ? $router.myPush({
                              path:
                                playingInfo.parentArticleType === 3 ? '/play-detail' : '/detail',
                              query: {
                                id: playingInfo.exhibitId,
                                subID: playingInfo.itemId,
                                albumName: playingInfo.exhibitTitle
                              }
                            })
                          : $router.myPush({
                              path:
                                playingInfo.parentArticleType === 3 ? '/play-detail' : '/detail',
                              query: { id: playingInfo.exhibitId }
                            })
                      "
                    >
                      {{ playingInfo?.itemTitle || playingInfo.exhibitTitle }}
                    </span>
                  </my-tooltip>
                  <div
                    class="artist"
                    v-if="playingInfo.articleInfo?.articleProperty?.display_artist"
                  >
                    {{ playingInfo.articleInfo?.articleProperty?.display_artist }}
                  </div>
                  <my-tooltip :content="playingInfo?.albumName" v-if="playingInfo.albumName">
                    <span
                      class="album album-title"
                      @click="
                        $router.myPush({
                          path: playingInfo.parentArticleType === 3 ? '/play-detail' : '/detail',
                          query: { id: playingInfo.exhibitId }
                        })
                      "
                    >
                      {{ playingInfo.albumName }}
                    </span>
                  </my-tooltip>
                  <span class="album album-title single-song" v-else>单曲</span>
                </template>
                <span class="no-data-title" v-else>暂无播放的声音</span>
              </div>
            </div>

            <div class="controls-area">
              <button
                type="button"
                class="control-btn"
                :class="{ disabled: item.disabled }"
                v-for="item in leftBtnList"
                :key="item.icon"
                @click="item.operate"
              >
                <i class="freelog" :class="item.icon" />
              </button>
            </div>

            <div class="progress-area">
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
              <span class="time total-time" v-if="playingInfo">
                {{ secondsToHMS(playingInfo.versionInfo.exhibitProperty.duration) }}
              </span>
              <span class="time total-time" v-else>00:00</span>
            </div>

            <div class="actions-area">
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
                  @click="item.operate"
                >
                  <i class="freelog" :class="item.icon" />
                </button>
              </template>
            </div>

            <button type="button" class="collapse-btn" @click="startCollapsePlayer">
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
      >
        <div class="pc-player-v2-collapsed" :class="{ 'is-expanded': collapsedDockExpanded }">
          <button type="button" class="expand-btn" @click="expandPlayer">
            <i class="freelog fl-icon-icon_back" />
          </button>
          <div class="collapsed-controls">
            <button
              type="button"
              class="control-btn"
              :class="{ disabled: item.disabled }"
              v-for="item in leftBtnList"
              :key="item.icon"
              @click="item.operate"
            >
              <i class="freelog" :class="item.icon" />
            </button>
          </div>
          <div class="collapsed-cover" @click="onCollapsedCoverClick">
            <el-progress
              class="cover-ring"
              type="circle"
              :percentage="percentage"
              color="#44d7b6"
              :width="68"
              :stroke-width="3"
              :show-text="false"
            />
            <div
              class="cover-spin-wrap"
              :class="{ 'is-spinning': playingInfo, 'is-paused': !playing }"
            >
              <img
                class="cover"
                :src="playingInfo.coverImages && playingInfo.coverImages[0]"
                v-if="playingInfo"
              />
              <img class="default-avatar" src="../assets/images/default-avatar.png" v-else />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import playerMixin from "./player.mixin.js";
import playStatus from "@/components/play-status.vue";
import myTooltip from "@/components/tooltip.vue";
import playerPlaylistSkeleton from "@/components/player-playlist-skeleton.vue";

export default {
  name: "player-v2",

  mixins: [playerMixin],

  components: {
    playStatus,
    myTooltip,
    playerPlaylistSkeleton
  },

  data() {
    return {
      collapsedDockExpanded: false,
      collapsedExpandTimer: null,
      collapseAnimating: false,
      collapseAnimationTimer: null
    };
  },

  watch: {
    "store.playerCollapsed"() {
      this.resetCollapsedDockExpand();
    },

    "store.playerShowStatus"(val) {
      if (val && !this.store.playerCollapsed) {
        this.show = true;
      }
    }
  },

  beforeDestroy() {
    this.clearCollapsedExpandTimer();
    this.clearCollapseAnimation();
  },

  computed: {
    utilityBtnList() {
      return this.rightBtnList.filter(item => item.name !== "showBtn");
    }
  },

  methods: {
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
      this.resetCollapsedDockExpand();
    },

    onCollapsedCoverClick() {
      if (this.collapsedDockExpanded) {
        this.expandPlayer();
      }
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
      this.$el.style.removeProperty("--collapse-scale");
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

      playerEl.style.setProperty("--collapse-dx", `${targetCenterX - (rect.left + rect.width / 2)}px`);
      playerEl.style.setProperty("--collapse-dy", `${targetCenterY - (rect.top + rect.height / 2)}px`);
      playerEl.style.setProperty("--collapse-scale", collapseScale);
      this.$el.style.setProperty("--collapse-scale", collapseScale);

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
      this.$el.style.removeProperty("--collapse-scale");

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
        item?.articleInfo?.articleOwnerName ||
        ""
      );
    },

    getItemAlbum(item) {
      return item.albumName || "单曲";
    },

    goToItemAlbum(item) {
      if (!item.albumName) return;
      this.$router.myPush({
        path: item.parentArticleType === 3 ? "/play-detail" : "/detail",
        query: { id: item.exhibitId }
      });
    },

    goToItemDetail(item) {
      const path = item.parentArticleType === 3 ? "/play-detail" : "/detail";
      if (item.itemId) {
        this.$router.myPush({
          path,
          query: {
            id: item.exhibitId,
            subID: item.itemId,
            albumName: item.albumName || item.exhibitTitle
          }
        });
      } else {
        this.$router.myPush({
          path,
          query: { id: item.exhibitId }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "@/assets/css/player.less";
@import "@/assets/css/player-v2.less";
</style>
