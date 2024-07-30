<!-- 音乐、专辑详情页 -->
<template>
  <div class="detail-wrapper">
    <!-- <transition name="detail-fade"> -->
    <!-- <template v-if="voiceInfo"> -->
    <!-- mobile -->
    <div class="mobile-detail-wrapper" v-if="store.inMobile">
      <div ref="cover" class="cover-area">
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
      </div>
      <div class="title-area">
        <img class="auth-link-abnormal" :src="AuthLinkAbnormalIcon" v-if="authLinkAbnormal" />
        <i
          class="freelog fl-icon-suoding lock"
          @click.stop="getAuth()"
          v-if="voiceInfo?.defaulterIdentityType >= 4"
        ></i>
        <my-tooltip class="title" :content="voiceInfo?.exhibitTitle">
          <span>{{ voiceInfo?.exhibitTitle }}</span>
        </my-tooltip>
      </div>

      <div class="info-area">
        <div class="info-item">
          <i class="freelog fl-icon-gengxinshijian"></i>
          <div class="item-value">{{ voiceInfo?.updateDate }}</div>
        </div>
        <div class="info-item">
          <i class="freelog fl-icon-yonghu"></i>
          <div class="item-value">{{ voiceInfo?.signCount }}</div>
        </div>
        <div class="duration" v-if="voiceInfo.articleInfo?.articleType === 1">
          时长{{ relativeTime(voiceInfo?.versionInfo.exhibitProperty.duration) }}
        </div>
      </div>

      <div class="play-voice-btn" :class="{ disabled: btnList[0].disabled }" @click="playOrPause()">
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
      <div class="intro">{{ voiceInfo?.exhibitIntro }}</div>
      <div
        class="cover-to-add"
        :class="{ animation: addAnimation }"
        :style="{ '--left': coverLeft + 'px', '--top': coverTop + 'px' }"
      >
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
      </div>
    </div>

    <!-- PC -->
    <div class="pc-detail-wrapper" v-if="!store.inMobile">
      <div ref="cover" class="cover-area">
        <img class="cover" :src="voiceInfo?.coverImages[0]" />
        <div class="btn-modal" v-if="ifSupportMime">
          <div class="btn" @click.stop="playOrPause()">
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

        <div class="info-detail">
          <div class="detail-item">
            <span class="name">专辑:</span>
            <span class="value">XXX</span>
          </div>

          <div class="detail-item">
            <span class="name">歌手:</span>
            <span class="value">XXX</span>
          </div>

          <div class="detail-item">
            <span class="name">语言:</span>
            <span class="value">XXX</span>
          </div>

          <div class="detail-item">
            <span class="name">唱片公司:</span>
            <span class="value">XXX</span>
          </div>

          <div class="detail-item">
            <span class="name">唱片类型:</span>
            <span class="value">XXX</span>
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
              <div class="playing-mark" v-if="playingInfo.exhibitId === voiceInfo?.exhibitId">
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
              <div class="index">{{ index + 1 }}</div>
              <div class="music">{{ item.exhibitTitle }}</div>
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

export default {
  name: "detail",

  components: { playStatus, myTooltip },

  data() {
    const store = useGlobalStore();

    return {
      AuthLinkAbnormalIcon,
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
      subTempData: []
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
        this.isCollected = useMyCollection.ifExist(this.id);
      },
      immediate: true
    },

    "store.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist(this.id);
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
      const exhibit = this.voiceInfo.itemId || this.voiceInfo.exhibitId;

      return playing && [playingInfo.exhibitId, playingInfo.itemId].includes(exhibit);
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
          operate: this.playOrPause,
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
    /** 播放/暂停 */
    playOrPause() {
      useMyPlay.playOrPause(this.voiceInfo);
    },

    /** 加入播放列表 */
    addToPlayList() {
      useMyPlay.addToPlayList(this.id);
    },

    /** 收藏/取消收藏 */
    operateCollect() {
      useMyCollection.operateCollect(this.voiceInfo);
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
        const { articleInfo, exhibitName } = exhibitInfo.data.data;
        if (articleInfo.articleType === 2) {
          this.getCollectionList(this.id, exhibitName);
        }
      }

      this.href = freelogApp.getCurrentUrl();
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.voiceInfo);
    },

    /** 获取合集里的单品列表 */
    async getCollectionList(collectionID, exhibitName) {
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
          });
        }
      }

      this.subTempData.push(...dataList);
      this.collectionData = [...this.collectionData, ...dataList];

      if (this.subTempData.length < this.subTotal) {
        this.subSkip = this.subSkip + 1_000;
        this.getCollectionList(collectionID, exhibitName);
      } else {
        this.subTotal = 0;
        this.subSkip = 0;
        this.subTempData = [];
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "@/assets/css/detail.less";
</style>
