<!-- 音乐、专辑详情页 -->
<template>
  <div class="detail-wrapper">
    <!-- <transition name="detail-fade"> -->
    <!-- <template v-if="voiceInfo"> -->
    <!-- mobile -->
    <div class="mobile-detail-wrapper" v-if="store.inMobile">
      <div class="top-area">
        <!-- 封面 -->
        <div class="banner">
          <img :src="store.selfConfig.options_node_banner || MobileDefaultBanner" alt="节点封面" />
        </div>
        <!-- 信息 -->
        <div class="info-area">
          <div class="title-date-wrap">
            <div class="title-area">
              <img class="auth-link-abnormal" :src="AuthLinkAbnormalIcon" v-if="authLinkAbnormal" />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth()"
                v-if="voiceInfo?.defaulterIdentityType >= 4"
              ></i>
              <my-tooltip :content="voiceInfo?.exhibitTitle">
                <span class="title">{{ voiceInfo?.exhibitTitle }}</span>
              </my-tooltip>
            </div>

            <div class="date-count">
              <div class="info-item">
                <i class="freelog fl-icon-gengxinshijian"></i>
                <div class="item-value">{{ relativeTime(voiceInfo?.updateDate) }}</div>
              </div>
              <div class="info-item">
                <i class="freelog fl-icon-danji"></i>
                <div class="item-value">{{ voiceInfo?.signCount }}</div>
              </div>
            </div>
          </div>

          <!-- 按钮 -->
          <div class="btns-area">
            <div
              class="play-btn"
              :class="{ disabled: btnList[0].disabled }"
              @click.stop="btnList[0].operate"
            >
              <i class="freelog" :class="btnList[0].icon"></i>
              <div class="label">{{ btnList[0].title }}</div>
            </div>
            <template v-for="item in btnList.filter((_, i) => [1, 2].includes(i))">
              <div class="btn" :class="{ disabled: item.disabled }" @click="item.operate">
                <i class="freelog" :class="item.icon"></i>
              </div>
            </template>
            <input id="href" class="hidden-input" :value="href" readOnly />
          </div>
        </div>
      </div>

      <div class="bottom-area" v-if="voiceInfo?.articleInfo.articleType === 2">
        <div class="tab-box">
          <div class="tab" :class="tab === 1 && 'active'" @click="changeTab(1)">音乐</div>
          <div class="tab" :class="tab === 2 && 'active'" @click="changeTab(2)">专辑介绍</div>
        </div>

        <div class="music-content-box">
          <div
            class="content-item"
            v-for="(item, index) in collectionData"
            :key="index"
            v-if="tab === 1"
          >
            <div class="index">{{ changeIndex(index + 1) }}</div>

            <div class="info-box">
              <div class="info">
                <span
                  class="title"
                  @click="
                    $router.myPush({
                      path: '/detail',
                      query: { id: item.exhibitId, subID: item.itemId, albumName: item.albumName }
                    })
                  "
                >
                  <img class="auth-link-abnormal" :src="AuthLinkAbnormal" v-if="authLinkAbnormal" />
                  <i
                    class="freelog fl-icon-suoding lock"
                    @click.stop="getAuth(item)"
                    v-if="item.defaulterIdentityType >= 4"
                  ></i>
                  {{ item.exhibitTitle }}
                </span>
                <span class="desc">{{ item.exhibitIntro }}</span>
              </div>
              <div class="btns-area" :class="{ opacity: authLinkAbnormal }">
                <span class="time">{{
                  secondsToHMS(item.versionInfo.exhibitProperty.duration)
                }}</span>
                <i
                  class="freelog fl-icon-gengduo_yuandian_zongxiang"
                  @click="
                    () => {
                      moreMenuShow = true;
                      selectedData = item;
                    }
                  "
                />
              </div>
            </div>
            <!-- 更多菜单 -->
            <transition name="fade">
              <div
                class="modal"
                @click="moreMenuShow = false"
                v-if="moreMenuShow && isSelectedData(item)"
              ></div>
            </transition>
            <transition name="slide-up-fade">
              <div class="more-menu-card" v-if="moreMenuShow && isSelectedData(item)">
                <div class="btns">
                  <div
                    class="btn"
                    :class="{ disabled: btn?.disabled }"
                    v-for="btn in menuBtnList(item)"
                    :key="btn?.label"
                    @click="btn?.operate"
                  >
                    <i class="freelog" :class="btn?.icon"></i>
                    <div class="label">{{ btn?.label }}</div>
                  </div>
                </div>
                <div class="close-btn" @click="moreMenuShow = false">关闭</div>
              </div>
            </transition>
          </div>

          <div class="single-content-intro" v-else>
            <div class="detail"></div>

            <div class="intro">{{ voiceInfo?.exhibitIntro }}</div>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="single-content-intro">
          <div class="detail"></div>

          <div class="intro">{{ voiceInfo?.exhibitIntro }}</div>
        </div>
      </div>
    </div>

    <!-- PC -->
    <div class="pc-detail-wrapper" v-if="!store.inMobile">
      <div ref="cover" class="cover-area">
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
        <div class="btn-modal" v-if="ifSupportMime">
          <div class="btn" @click.stop="playOrPause">
            <i
              class="freelog"
              :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
            ></i>
          </div>
        </div>
      </div>

      <div class="right-area">
        <div class="title-area">
          <img class="auth-link-abnormal" :src="AuthLinkAbnormalIcon" v-if="authLinkAbnormal" />
          <i
            class="freelog fl-icon-suoding lock"
            @click.stop="getAuth()"
            v-if="voiceInfo?.defaulterIdentityType >= 4"
          ></i>

          <my-tooltip :content="voiceInfo?.exhibitTitle">
            <span class="title">{{ voiceInfo?.exhibitTitle }}</span>
          </my-tooltip>
        </div>

        <div class="info-area">
          <div class="info-item">
            <i class="freelog fl-icon-gengxinshijian"></i>
            <div class="item-value">{{ relativeTime(voiceInfo?.updateDate) }}</div>
          </div>
          <div class="info-item" v-if="albumName">
            <div class="item-value">收录于专辑</div>
            <div class="item-album">{{ albumName }}</div>
          </div>
        </div>

        <div class="info-detail" v-if="!subID">
          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.display_artist">
            <span class="name">艺人:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.display_artist }}</span>
          </div>
          <div class="detail-item" v-if="albumName">
            <span class="name">专辑:</span>
            <span class="value">{{ albumName }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.lyric_language">
            <span class="name">语种:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.lyric_language }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.label_name">
            <span class="name">厂牌:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.label_name }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.release_date">
            <span class="name">发行时间:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.release_date }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_lyricist">
            <span class="name">作词:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.song_lyricist }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_composer">
            <span class="name">作曲:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.song_composer }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_arranger">
            <span class="name">编曲:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.song_arranger }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.music_genre">
            <span class="name">风格:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.music_genre }}</span>
          </div>
        </div>

        <div class="info-detail" v-else>
          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.display_artist">
            <span class="name">艺人:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.display_artist }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.label_name">
            <span class="name">厂牌:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.label_name }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.release_date">
            <span class="name">发行时间:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.release_date }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.lyric_language">
            <span class="name">语种:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.lyric_language }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.release_type">
            <span class="name">类型:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.release_type }}</span>
          </div>

          <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.music_genre">
            <span class="name">风格:</span>
            <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.music_genre }}</span>
          </div>
        </div>

        <div class="intro">{{ voiceInfo?.exhibitIntro }}</div>

        <div class="btns-area">
          <template v-if="playingInfo">
            <div
              class="duration"
              v-if="
                voiceInfo?.articleInfo?.articleType === 1 &&
                playingInfo.exhibitId !== voiceInfo?.exhibitId
              "
            >
              时长{{ secondsToHMS(voiceInfo?.versionInfo?.exhibitProperty.duration) }}
            </div>
            <transition name="slide-right">
              <div
                class="playing-mark"
                v-if="
                  `${playingInfo.exhibitId}${playingInfo.itemId ?? ''}` ===
                  `${voiceInfo?.exhibitId}${voiceInfo?.itemId ?? ''}`
                "
              >
                <play-status :playing="store.playing" />
                <div class="progress">
                  <span>{{ secondsToHMS(store.progress * 1000) }}</span>
                  <span class="progress-divider">/</span>
                  <span>{{ secondsToHMS(voiceInfo?.versionInfo.exhibitProperty.duration) }}</span>
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

        <div class="album-content" v-if="voiceInfo?.articleInfo.articleType === 2">
          <div class="title">包含音乐（{{ collectionData.length }}）</div>
          <div class="content-item-wrap">
            <div class="content-item" v-for="(item, index) in collectionData" :key="item.itemId">
              <div class="index">{{ changeIndex(index + 1) }}</div>
              <div class="music">
                {{ item.exhibitTitle }}
              </div>
              <div class="album-sub-btns-area" :class="{ opacity: authLinkAbnormal }">
                <myTooltip
                  :content="btn.title"
                  v-for="btn in albumSubBtnList(item)"
                  :key="btn.title"
                >
                  <i
                    class="freelog text-btn"
                    :class="[btn.icon, { disabled: btn.disabled }]"
                    @click="btn.operate"
                  />
                </myTooltip>
              </div>
              <div class="singer">{{ item.intro }}</div>
              <div class="time">{{ secondsToHMS(item.articleInfo.articleProperty.duration) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
      </div> -->
    </div>
  </div>
  <!-- </template> -->
  <!-- </transition> -->
</template>

<script>
import { freelogApp } from "freelog-runtime";
import playStatus from "@/components/play-status.vue";
import myTooltip from "@/components/tooltip.vue";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { showToast, relativeTime, secondsToHMS } from "@/utils/common";
import { useGlobalStore } from "@/store/global";

import AuthLinkAbnormalIcon from "@/assets/images/auth-link-abnormal.png";
import MobileDefaultBanner from "@/assets/images/mobile-default-banner.webp";
import AuthLinkAbnormal from "@/assets/images/auth-link-abnormal.png";

export default {
  name: "detail",

  components: { playStatus, myTooltip },

  data() {
    const store = useGlobalStore();

    return {
      AuthLinkAbnormalIcon,
      MobileDefaultBanner,
      AuthLinkAbnormal,
      id: "",
      subID: "",
      albumName: "",
      voiceInfo: null,
      isCollected: false,
      isInPlayList: false,
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
      href: "",
      collectionData: [],
      store,
      relativeTime,
      secondsToHMS,
      subTotal: 0,
      subSkip: 0,
      subTempData: [],
      tab: 1,
      selectedData: {},
      moreMenuShow: false
    };
  },

  watch: {
    "$route.query": {
      handler(cur) {
        const app = document.getElementById("app");
        app.scroll({ top: 0 });
        this.id = cur.id;
        this.subID = cur.subID;
        this.albumName = cur.albumName;
        this.getVoiceInfo();
      },
      immediate: true
    },

    // "$route.query.subID": {
    //   handler(cur) {
    //     console.log("cur2", cur);
    //     if (!cur) return;
    //     this.subID = cur;
    //   },
    //   immediate: true
    // },

    "store.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist({ exhibitId: this.id, itemId: this.itemId });
      },
      immediate: true
    },

    "store.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist({ exhibitId: this.id, itemId: this.itemId });
      },
      immediate: true
    },

    "store.authIdList"(cur) {
      if (cur.includes(this.voiceInfo.exhibitId)) this.voiceInfo.defaulterIdentityType = 0;
    }
  },

  computed: {
    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.voiceInfo?.defaulterIdentityType);
    },

    /** 是否为支持格式 */
    ifSupportMime() {
      const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
      return supportMimeList.includes(this.voiceInfo?.versionInfo.exhibitProperty.mime);
    },

    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.store;
      const playingId = `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ""}`;
      const exhibit = `${this.voiceInfo.exhibitId}${this.voiceInfo.itemId ?? ""}`;

      return playing && playingId === exhibit;
    },

    /** 播放中声音信息 */
    playingInfo() {
      return this.store.playingInfo;
    },

    /** 操作按钮群 */
    btnList() {
      return [
        {
          icon:
            this.voiceInfo?.articleInfo?.articleType === 1
              ? !this.ifSupportMime
                ? "fl-icon-wufabofang"
                : this.playing
                ? "fl-icon-zanting-daibiankuang"
                : "fl-icon-bofang-daibiankuang"
              : this.authLinkAbnormal
              ? "fl-icon-zanting-daibiankuang"
              : "fl-icon-bofang-daibiankuang",
          title:
            this.voiceInfo?.articleInfo?.articleType === 1
              ? !this.ifSupportMime
                ? "无法播放"
                : this.playing
                ? "暂停"
                : "播放"
              : this.authLinkAbnormal
              ? "无法播放"
              : "播放全部",
          operate:
            this.voiceInfo?.articleInfo?.articleType === 1 ? this.playOrPause : this.playOrPauseAll,
          disabled:
            this.voiceInfo?.articleInfo?.articleType === 1
              ? !this.ifSupportMime
              : this.authLinkAbnormal
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          title: "加入播放列表",
          operate: this.addToPlayList,
          disabled: this.isInPlayList || !this.ifSupportMime
        },
        {
          icon: this.isCollected
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          title: this.isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: this.share }
      ];
    }
  },

  methods: {
    /** 查看音乐详情 */
    toMusicDetail(item) {
      this.moreMenuShow = false;
      this.$router.myPush({
        path: "/detail",
        query: { id: item.exhibitId, subID: item.itemId, albumName: item.albumName }
      });
    },
    /** 更多菜单按钮群 */
    menuBtnList(item) {
      return [
        {
          icon: !this.ifSupportMimeSub(item.versionInfo?.exhibitProperty?.mime)
            ? "fl-icon-wufabofang"
            : this.playingSub({ exhibitId: item.exhibitId, itemId: item.itemId })
            ? "fl-icon-zanting-daibiankuang"
            : "fl-icon-bofang-daibiankuang",
          label: !this.ifSupportMimeSub(item.versionInfo?.exhibitProperty?.mime)
            ? "无法播放"
            : this.playingSub({ exhibitId: item.exhibitId, itemId: item.itemId })
            ? "暂停音乐"
            : "播放音乐",
          operate: () => this.playOrPause(item),
          disabled: !this.ifSupportMimeSub(item.versionInfo?.exhibitProperty?.mime)
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          label: "加入播放列表",
          operate: () => this.addToPlayListSub({ exhibitId: item.exhibitId, itemId: item.itemId }),
          disabled:
            this.isInPlayListSub(item) ||
            !this.ifSupportMimeSub(item.versionInfo?.exhibitProperty?.mime)
        },
        {
          icon: "fl-icon-danji",
          label: "查看音乐详情",
          operate: () => this.toMusicDetail(item)
        },
        {
          icon: this.isCollectedSub(item)
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          label: this.isCollectedSub(item) ? "取消收藏" : "收藏",
          operate: () => this.operateCollect(item)
        }
      ].filter(Boolean);
    },
    changeIndex(index) {
      if (index > 1 && index < 10) {
        return index.toString().padStart(2, "0");
      }
      return index.toString();
    },
    changeTab(tab) {
      this.tab = tab;
    },
    // 是否已选中数据
    isSelectedData(item) {
      return (
        `${item.exhibitId}${item.itemId ?? ""}` ===
        `${this.selectedData.exhibitId}${this.selectedData.itemId ?? ""}`
      );
    },
    isInPlayListSub(item) {
      return useMyPlay.ifExist({ exhibitId: item.exhibitId, itemId: item.itemId });
    },
    isCollectedSub(item) {
      return useMyCollection.ifExist({ exhibitId: item.exhibitId, itemId: item.itemId });
    },
    /** 是否播放中Sub */
    playingSub(item) {
      const { playing, playingInfo } = this.store;
      const playingId = `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ""}`;
      const exhibit = `${item.exhibitId}${item.itemId ?? ""}`;

      return playing && playingId === exhibit;
    },

    /** 加入播放列表 */
    addToPlayListSub(item) {
      useMyPlay.addToPlayList({ exhibitId: item.exhibitId, itemId: item.itemId });
    },
    /** 是否为支持格式 */
    ifSupportMimeSub(item) {
      const supportMimeList = ["audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
      return supportMimeList.includes(item?.articleInfo?.articleProperty.mime);
    },
    albumSubBtnList(item) {
      return [
        {
          icon: !this.ifSupportMimeSub(item)
            ? "fl-icon-wufabofang"
            : this.playingSub(item)
            ? "fl-icon-zanting-daibiankuang"
            : "fl-icon-bofang-daibiankuang",
          title: this.playingSub(item) ? "暂停" : "播放",
          operate: () => this.playOrPause(item),
          disabled: !this.ifSupportMimeSub(item)
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          title: "加入播放列表",
          operate: () => this.addToPlayListSub(item),
          disabled: this.isInPlayListSub(item) || !this.ifSupportMimeSub(item)
        },
        {
          icon: this.isCollectedSub(item)
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          title: this.isCollectedSub(item) ? "取消收藏" : "收藏",
          operate: () => this.operateCollect(item)
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: this.share }
      ];
    },

    /** 播放全部/暂停  */
    async playOrPauseAll() {
      // 首先专辑默认第一首播放，其余的全部加入播放列表
      const restCollectionData = this.collectionData.slice(1);

      await useMyPlay.playOrPause(this.collectionData[0], "normal", async () => {
        if (!restCollectionData.length) {
          return;
        }
        for (const iterator of restCollectionData) {
          await useMyPlay.addToPlayList({ exhibitId: iterator.exhibitId, itemId: iterator.itemId });
        }
      });
    },

    /** 播放/暂停 */
    playOrPause(item) {
      useMyPlay.playOrPause(item.itemId ? item : this.voiceInfo);
    },

    /** 加入播放列表 */
    addToPlayList() {
      useMyPlay.addToPlayList({ exhibitId: this.id, itemId: this.subID });
    },

    /** 收藏/取消收藏 */
    operateCollect(item) {
      useMyCollection.operateCollect(item.itemId ? item : this.voiceInfo);
    },

    /** 分享 */
    share() {
      if (this.store.inMobile) {
        const input = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
      } else {
        this.store.setData({
          key: "shareInfo",
          value: { show: true, exhibit: this.voiceInfo }
        });
      }
    },

    /** 获取音乐详情 */
    async getVoiceInfo() {
      this.voiceInfo = null;
      // 合集中的一个单品
      if (this.subID) {
        const [exhibitInfo, subInfo, subStatusInfo] = await Promise.all([
          freelogApp.getExhibitInfo(this.id, { isLoadVersionProperty: 1 }),
          freelogApp.getCollectionSubInfo(this.id, { itemId: this.subID }),
          freelogApp.getCollectionSubAuth(this.id, { itemIds: this.subID })
        ]);
        this.voiceInfo = {
          ...subInfo.data.data,
          coverImages: exhibitInfo.data.data.coverImages,
          versionInfo: { exhibitProperty: subInfo.data.data.articleInfo?.articleProperty },
          defaulterIdentityType: subStatusInfo.data.data[0].defaulterIdentityType,
          exhibitTitle: subInfo.data.data.itemTitle,
          updateDate: subInfo.data.data.articleInfo?.latestVersionReleaseDate
        };
      } else {
        // 普通展品
        const [exhibitInfo, signCountData, statusInfo] = await Promise.all([
          freelogApp.getExhibitInfo(this.id, { isLoadVersionProperty: 1 }),
          freelogApp.getExhibitSignCount(this.id),
          freelogApp.getExhibitAuthStatus(this.id)
        ]);
        this.voiceInfo = {
          ...exhibitInfo.data.data,
          signCount: signCountData.data.data[0].count,
          defaulterIdentityType: statusInfo.data.data[0].defaulterIdentityType
        };

        // 合集
        const { articleInfo, exhibitName, coverImages } = exhibitInfo.data.data;
        if (articleInfo.articleType === 2) {
          this.collectionData = [];
          this.getCollectionList(this.id, exhibitName, coverImages);
        }
      }

      this.href = freelogApp.getCurrentUrl();
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.voiceInfo);
    },

    /** 获取合集里的单品列表 */
    async getCollectionList(collectionID, exhibitName, coverImages) {
      const subList = await freelogApp.getCollectionSubList(collectionID, {
        skip: this.subSkip,
        limit: 1_000,
        isShowDetailInfo: 1
      });
      const { dataList, totalItem } = subList.data.data;
      this.subTotal = totalItem;

      if (dataList?.length !== 0) {
        const ids = dataList.map(item => item.itemId).join();
        const statusInfo = await freelogApp.getCollectionSubAuth(collectionID, {
          itemIds: ids
        });

        if (statusInfo.data.data) {
          dataList.forEach(item => {
            const index = statusInfo.data.data.findIndex(
              resultItem => resultItem.itemId === item.itemId
            );
            if (index !== -1) {
              item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
            }

            item.exhibitTitle = item.itemTitle;
            item.exhibitIntro = item.articleInfo.intro;
            item.exhibitId = collectionID;
            item.coverImages = coverImages;
            item.versionInfo = { exhibitProperty: item.articleInfo.articleProperty };
          });
        }
      }

      this.subTempData.push(...dataList);
      this.collectionData = [...this.collectionData, ...dataList];

      if (this.subTempData.length < this.subTotal) {
        this.subSkip = this.subSkip + 1_000;
        this.getCollectionList(collectionID, exhibitName, coverImages);
      } else {
        this.subTotal = 0;
        this.subSkip = 0;
        this.subTempData = [];
      }
    },

    changeIndex(index) {
      if (index > 0 && index < 10) {
        return index.toString().padStart(2, "0");
      }
      return index.toString();
    }
  }
};
</script>

<style lang="less" scoped>
@import "@/assets/css/detail.less";
</style>
