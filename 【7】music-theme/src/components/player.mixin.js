import { freelogApp } from "freelog-runtime";
import playStatus from "@/components/play-status.vue";
import myTooltip from "@/components/tooltip.vue";
import { useMyAuth, useMyPlay, useMyCollection } from "@/utils/hooks";
import { secondsToHMS, showToast } from "@/utils/common";
import { useGlobalStore } from "@/store/global";

import DropArrow from "@/assets/images/arrow.png";

export default {
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
      modes: ["NORMAL", "REPEAT-ALL", "REPEAT-ONE", "RANDOM"], // 播放模式列表
      currentModeIndex: 0, // 当前模式索引
      currentRandomIndex: 0, // 当前随机播放索引
      shuffledList: [], // 随机播放列表
      randomPlayListSignature: "", // 播放列表曲目集合签名，用于避免无变化时重洗
      store
      // realDuration: ""
    };
  },

  watch: {
    "store.playMode": {
      handler(cur) {
        this.currentPlayMode = cur;
        this.currentModeIndex = this.modes.findIndex(f => f === cur);
        if (cur === "RANDOM") {
          this.refreshRandomPlayList({ reshuffle: true });
        }
      },
      immediate: true,
      deep: true
    },
    "store.playList": {
      handler(cur, pre) {
        // 确保数据同步
        this.playList = cur ? [...cur] : null;

        if (this.currentPlayMode === "RANDOM" && this.playList?.length) {
          this.refreshRandomPlayList();
        }
        // 加入播放列表，显示播放器动画
        if (cur && pre && cur.length - pre.length === 1) {
          this.store.setData({ key: "playerShowStatus", value: true });
          this.animation();
        }
        if (!cur || !this.store.inMobile) return;

        if (!this.infoAreaWidth) {
          this.infoAreaWidth = this.$refs.infoArea?.clientWidth;
        }

        if (this.playingInfo) {
          const index = cur.findIndex(item => item.exhibitId === this.playingInfo.exhibitId);
          this.touchMoveX = -this.infoAreaWidth * index;
        }
      },
      immediate: true,
      deep: true
    },

    "store.playingInfo": {
      handler(cur) {
        console.log("cur", cur);

        this.store.setData({ key: "progress", value: 0 });
        this.playingInfo = cur;

        if (this.currentPlayMode === "RANDOM" && cur) {
          this.syncRandomIndexToPlaying();
        }

        if (this.playList && this.store.inMobile) {
          const index = this.playList.findIndex(
            item => item.exhibitId === this.playingInfo?.exhibitId
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

    /** 进度条最大值（秒） */
    progressMax() {
      const duration = this.playingInfo?.versionInfo?.exhibitProperty?.duration;
      if (!duration) return 1;
      return duration / 1000;
    },

    /** 左区域按钮群 */
    leftBtnList() {
      return [
        {
          icon: "fl-icon-shangyiqu",
          operate: this.preVoice,
          disabled: this.store.playList?.length <= 1
        },
        {
          icon: this.playing ? "fl-icon-zanting1" : "fl-icon-bofang2",
          operate: this.playOrPause
        },
        {
          icon: "fl-icon-xiayiqu",
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
          icon:
            this.currentPlayMode === "NORMAL"
              ? "fl-icon-shunxubofang"
              : this.currentPlayMode === "RANDOM"
                ? "fl-icon-suijibofang1"
                : this.currentPlayMode === "REPEAT-ONE"
                  ? "fl-icon-liebiaoxunhuanbeifen"
                  : "fl-icon-liebiaoxunhuan",
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
          icon:
            this.currentPlayMode === "NORMAL"
              ? "fl-icon-shunxubofang"
              : this.currentPlayMode === "RANDOM"
                ? "fl-icon-suijibofang1"
                : this.currentPlayMode === "REPEAT-ONE"
                  ? "fl-icon-liebiaoxunhuanbeifen"
                  : "fl-icon-liebiaoxunhuan",
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

    trackKey(item) {
      if (!item) return "";
      const id = item.exhibitId ?? "";
      const sub = item.itemId ?? "";
      return `${id}${sub}`;
    },

    playListSignature(list) {
      if (!list?.length) return "";
      return list
        .map(item => this.trackKey(item))
        .sort()
        .join("\u0001");
    },

    getPlayingTrackKey() {
      return this.trackKey(this.store.playingInfo || this.playingInfo);
    },

    /**
     * 刷新随机列表：曲目未变时保持洗牌顺序，仅更新对象引用；
     * 避免 getPlayList 触发重洗导致 currentRandomIndex 错位（两首歌时易卡在同一首）。
     */
    refreshRandomPlayList({ reshuffle = false } = {}) {
      if (!this.playList?.length) {
        this.shuffledList = [];
        this.randomPlayListSignature = "";
        this.currentRandomIndex = 0;
        return;
      }

      const signature = this.playListSignature(this.playList);
      const sameTracks =
        !reshuffle &&
        signature === this.randomPlayListSignature &&
        this.shuffledList.length === this.playList.length;

      if (sameTracks) {
        this.shuffledList = this.shuffledList.map(
          item => this.playList.find(p => this.trackKey(p) === this.trackKey(item)) ?? item
        );
      } else {
        this.shuffledList = this.playList.slice();
        this.shuffleArray(this.shuffledList);
        this.randomPlayListSignature = signature;
      }

      if (this.getPlayingTrackKey()) {
        this.syncRandomIndexToPlaying();
      } else {
        this.currentRandomIndex = 0;
      }
    },

    /** 将 currentRandomIndex 对齐到当前正在播放的歌曲 */
    syncRandomIndexToPlaying() {
      if (!this.shuffledList?.length) return;
      const key = this.getPlayingTrackKey();
      if (!key) return;

      let idx = this.shuffledList.findIndex(item => this.trackKey(item) === key);
      if (idx < 0 && this.playList?.length) {
        const inPlay = this.playList.findIndex(item => this.trackKey(item) === key);
        if (inPlay >= 0) {
          const refKey = this.trackKey(this.playList[inPlay]);
          idx = this.shuffledList.findIndex(item => this.trackKey(item) === refKey);
        }
      }
      if (idx >= 0) this.currentRandomIndex = idx;
    },

    resolveRandomIndexForPlaying() {
      this.syncRandomIndexToPlaying();
      const key = this.getPlayingTrackKey();
      if (!key) return this.currentRandomIndex;
      const idx = this.shuffledList.findIndex(item => this.trackKey(item) === key);
      return idx >= 0 ? idx : this.currentRandomIndex;
    },

    /** 随机模式：从当前曲的下一首开始，列表多于 1 首时避免连播同一首 */
    advanceRandomIndex() {
      if (!this.shuffledList?.length) return;
      const len = this.shuffledList.length;
      if (len <= 1) {
        this.currentRandomIndex = 0;
        return;
      }

      const currentKey = this.getPlayingTrackKey();
      let idx = this.resolveRandomIndexForPlaying();
      let next = idx;
      let attempts = 0;

      do {
        next = (next + 1) % len;
        attempts += 1;
      } while (attempts < len && this.trackKey(this.shuffledList[next]) === currentKey);

      this.currentRandomIndex = next;
    },

    /** 关闭播放器 */
    closePlayer() {
      const store = useGlobalStore();
      store.setData({ key: "playerShowStatus", value: false });
      store.setData({ key: "playerCollapsed", value: false });
      this.show = false;
      this.volumePopupShow = false;
      this.playListPopupShow = false;
    },

    /** 收起播放器（右下角 compact 态） */
    collapsePlayer() {
      const store = useGlobalStore();
      store.setData({ key: "playerShowStatus", value: true });
      store.setData({ key: "playerCollapsed", value: true });
      this.show = false;
      this.volumePopupShow = false;
      this.playListPopupShow = false;
      this.clearCloseTimer();
    },

    /** 展开播放器 */
    expandPlayer() {
      const store = useGlobalStore();
      store.setData({ key: "playerCollapsed", value: false });
      this.show = true;
      this.clearCloseTimer();
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
      if (["NORMAL", "REPEAT-ALL", "REPEAT-ONE"].includes(this.currentPlayMode)) {
        useMyPlay.preVoice();
      } else {
        this.syncRandomIndexToPlaying();
        this.currentRandomIndex = this.currentRandomIndex - 1;
        if (this.currentRandomIndex < 0) {
          this.currentRandomIndex = this.shuffledList.length - 1;
        }
        useMyPlay.preVoice(this.shuffledList[this.currentRandomIndex]);
      }
    },

    /** 下一首 */
    nextVoice(data, type) {
      if (["NORMAL", "REPEAT-ALL", "REPEAT-ONE"].includes(this.currentPlayMode)) {
        useMyPlay.nextVoice();
      } else if (type === "AUTO") {
        useMyPlay.nextVoice(data);
      } else {
        this.syncRandomIndexToPlaying();
        this.currentRandomIndex = this.currentRandomIndex + 1;
        if (this.currentRandomIndex >= this.shuffledList.length) {
          this.currentRandomIndex = 0;
        }
        useMyPlay.nextVoice(this.shuffledList[this.currentRandomIndex]);
      }
    },

    /** 播放完成 */
    async endVoice() {
      if (this.playList.length === 1 && this.currentPlayMode === "NORMAL") {
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
      } else if (this.currentPlayMode === "REPEAT-ALL") {
        this.nextVoice();
      } else if (this.currentPlayMode === "REPEAT-ONE") {
        const tempData = this.playingInfo;
        await this.store.setData({ key: "progress", value: 0 });
        await this.store.setData({ key: "playingInfo", value: null });
        useMyPlay.playOrPause(tempData);
      } else {
        this.advanceRandomIndex();
        this.nextVoice(this.shuffledList[this.currentRandomIndex], "AUTO");
      }
    },

    /** 播放失败 */
    playError() {
      if (!this.playing) return;

      const supportMimeList = [
        "audio/mp4",
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/webm",
        "audio/flac"
      ];
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
        const copiedShareHref = `${window.location.origin}/${
          this.playingInfo.parentArticleType === 3 ? "play-detail" : "detail"
        }?id=${this.playingInfo.exhibitId}`;
        navigator.clipboard
          .writeText(copiedShareHref)
          .then(() => {
            showToast("链接复制成功～");
            freelogApp.pushMessage4Task({
              taskConfigCode: "TS000077",
              meta: { presentableId: this.playingInfo.exhibitId }
            });
            freelogApp.pushMessage4Task({
              taskConfigCode: "T0004004",
              meta: { presentableId: this.playingInfo.exhibitId }
            });
          })
          .catch(error => {
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
      if (data.articleInfo?.status === 2) {
        showToast("此作品因违规无法访问");
        return;
      }

      if (data.onlineStatus === 0) {
        showToast("作品已下架，无法访问");
        return;
      }

      if (![0, 4].includes(data.defaulterIdentityType)) {
        showToast("作品异常，无法访问");
        return;
      }

      if (!["音频"].includes(data?.articleInfo?.resourceType[0])) {
        showToast("此作品格式暂不支持访问");
        return;
      }
      console.log("data", data);
      useMyPlay.playOrPause(data);
    },

    /** 移出播放列表 */
    deleteVoice(id, itemId) {
      useMyPlay.removeFromPlayList(id, itemId);
      this.$refs.player.currentTime = 0;
    },

    /** 清空播放列表 */
    clearPlayList() {
      useMyPlay.clearPlayList();
      this.confirmDialogShow = false;
      if (this.$refs.player) {
        this.$refs.player.pause();
        this.$refs.player.currentTime = 0;
      }
      this.store.setData({ key: "progress", value: 0 });
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
      this.store.setData({ key: "playerShowStatus", value: true });
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
      if (!this.store.playerShowStatus || this.store.playerCollapsed) return;
      if (!this.show) this.show = true;
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
    },

    /** 处理播放事件 */
    handlePlay() {
      this.store.setData({ key: "playing", value: true });
    },

    /** 处理暂停事件 */
    handlePause() {
      this.store.setData({ key: "playing", value: false });
    }
  }
};
