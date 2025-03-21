<script setup lang="ts">
import { ref } from "vue";
import { freelogApp } from "freelog-runtime";
import { useRouter } from "vue-router";
import { absoluteTime } from "@/utils/common.js";
import { useMyPlay, useMyAuth } from "@/utils/hooks";
import { useGlobalStore } from "@/store/global";
// 图片
import MoreIcon from "@/assets/images/arrow.png";
import TimeIcon from "@/assets/images/time.png";
import AlbumIcon from "@/assets/images/album.png";
import AuthLinkAbnormal from "@/assets/images/auth-link-abnormal.png";
import Freeze from "@/assets/images/freeze.png";
import type { Exhibit } from "@/interface";

const props = defineProps<{
  data: Exhibit[];
}>();
const router = useRouter();
const store = useGlobalStore();
const collectionData = ref<Exhibit[]>([]);
const albumData = ref<Exhibit[]>(
  props.data.sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
);
const dropVisible = ref<boolean>(false);
const selectedValue = ref<number>(1); // 1-最新发布 2-最早发布
const dropWrapper = ref<HTMLElement | null>(null);

const handleShowDrop = () => {
  dropVisible.value = !dropVisible.value;
};

const authLinkAbnormal = (defaulterIdentityType: number) => {
  return ![0, 4].includes(defaulterIdentityType);
};

const playing = (exhibitId: string) => {
  const { playingInfo, playing } = store;
  if (exhibitId !== playingInfo?.exhibitId) {
    return;
  }
  const albumItemIds = collectionData.value.map(i => `${i.exhibitId}${i.itemId}`);
  const playingId = `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ""}`;
  return playing && albumItemIds.includes(playingId);
};

/** 授权 */
const getAuth = data => {
  useMyAuth.getAuth(data);
};

/** 播放▶专辑 */
const playOrPause = async item => {
  const { playingInfo } = store;

  if (item.defaulterIdentityType === 4) {
    useMyAuth.getAuth(item);
    return;
  }

  if (item.exhibitId === playingInfo?.exhibitId) {
    const playingData = collectionData.value.filter(
      i =>
        `${i.exhibitId}${i.itemId ?? ""}` === `${playingInfo.exhibitId}${playingInfo.itemId ?? ""}`
    );

    useMyPlay.playOrPause(playingData[0]);
    return;
  }

  collectionData.value = [];
  const exhibitInfo = await freelogApp.getExhibitListById({
    exhibitIds: item.exhibitId,
    isLoadVersionProperty: 1
  });

  const { exhibitName, coverImages } = exhibitInfo.data.data[0];

  await getCollectionList({ exhibitId: item.exhibitId, exhibitName, coverImages });
  // 首先专辑默认第一首播放，其余的全部加入播放列表
  const restCollectionData = collectionData.value.slice(1);
  await useMyPlay.playOrPause(collectionData.value[0], "normal", async () => {
    if (!restCollectionData.length) {
      return;
    }
    for (const iterator of restCollectionData) {
      await useMyPlay.addToPlayList({ exhibitId: iterator.exhibitId, itemId: iterator.itemId });
    }
    // collectionData.value = [];
  });
};

/** 获取合集里的单品列表 */
let subTotal = 0;
let subSkip = 0;
let subTempData = [];

const getCollectionList = async (obj: {
  exhibitId: string;
  exhibitName: string;
  coverImages: string[];
}) => {
  const subList = await freelogApp.getCollectionSubList(obj.exhibitId, {
    skip: subSkip,
    limit: 1_000,
    isShowDetailInfo: 1
  });
  const { dataList, totalItem } = subList.data.data;
  subTotal = totalItem;

  if (dataList.length !== 0) {
    const ids = dataList.map((item: any) => item.itemId).join();
    const statusInfo = await (freelogApp as any).getCollectionSubAuth(obj.exhibitId, {
      itemIds: ids
    });

    if (statusInfo.data.data) {
      dataList.forEach((item: Exhibit) => {
        const index = statusInfo.data.data.findIndex(
          resultItem => resultItem.itemId === item.itemId
        );
        if (index !== -1) {
          item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
        }

        item.updateDate = item.articleInfo.latestVersionReleaseDate;
        item.coverImages = obj.coverImages;
        item.versionInfo = { exhibitProperty: item.articleInfo?.articleProperty };
        item.exhibitTitle = item.itemTitle;
        item.exhibitIntro = item.articleInfo.intro;
        item.albumName = obj.exhibitName;
        item.exhibitId = obj.exhibitId;
      });
    }
  }

  subTempData.push(...dataList);
  collectionData.value = [...collectionData.value, ...dataList];

  if (subTempData.length < subTotal) {
    subSkip = subSkip + 1_000;
    await getCollectionList({
      exhibitId: obj.exhibitId,
      exhibitName: obj.exhibitName,
      coverImages: obj.coverImages
    });
  } else {
    subTotal = 0;
    subSkip = 0;
    subTempData = [];
  }
};
</script>

<template>
  <!-- mobile -->
  <div class="mobile-album-wrap">
    <!-- 最新发布 | 最早发布 -->
    <div
      class="album-drop-wrapper"
      ref="dropWrapper"
      v-if="$route.name === 'voice-list' && store.inMobile"
    >
      <div class="selected-box" @click="handleShowDrop">
        <div class="txt">{{ selectedValue === 1 ? "最新发布" : "最早发布" }}</div>
        <div class="drop-trigger" :class="dropVisible ? 'rotate' : ''">
          <div class="triangle"></div>
        </div>
      </div>
    </div>
    <!-- 专辑内容 -->
    <div class="album-content-box">
      <div class="content-item" v-for="(item, index) in props.data" :key="index">
        <div class="info-box">
          <!-- 封面 -->
          <div
            class="cover-image"
            @click="router.myPush({ path: '/detail', query: { id: item.exhibitId } })"
          >
            <img :src="item.coverImages[0]" alt="歌曲封面" />
            <div class="btn" @click.stop="playOrPause(item)">
              <i
                class="freelog"
                :class="playing(item.exhibitId) ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
              ></i>
            </div>
            <div class="offline" v-if="item.onlineStatus === 0"><span>已下架</span></div>
          </div>
          <!-- 详细信息 -->
          <div class="info">
            <div class="top-area">
              <img
                class="freeze-lock"
                :src="Freeze"
                alt="封禁"
                v-if="item?.articleInfo?.status === 2"
              />
              <div class="offline" v-else-if="item.onlineStatus === 0">
                <span>已下架</span>
              </div>
              <img
                class="auth-link-abnormal"
                :src="AuthLinkAbnormal"
                alt="授权链异常"
                v-else-if="authLinkAbnormal(item.defaulterIdentityType)"
              />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth(item)"
                alt="未授权"
                v-if="item.defaulterIdentityType >= 4"
              ></i>
              <span
                class="title"
                @click="router.myPush({ path: '/detail', query: { id: item.exhibitId } })"
                >{{ item.exhibitTitle }}</span
              >
            </div>

            <div class="desc">
              <div class="time-box">
                <div class="icon">
                  <img :src="TimeIcon" alt="更新时间" />
                </div>
                <span class="time">{{
                  absoluteTime(item?.versionInfo?.exhibitProperty?.release_date || item.createDate)
                }}</span>
              </div>

              <div class="album-box">
                <div class="icon">
                  <img :src="AlbumIcon" alt="专辑" />
                </div>
                <span class="album">{{ item.signCount }}</span>
              </div>
            </div>
          </div>
          <div
            class="more-icon"
            @click="router.myPush({ path: '/detail', query: { id: item.exhibitId } })"
          >
            <img :src="MoreIcon" alt="更多" />
          </div>
        </div>
      </div>
    </div>

    <!-- 选项弹窗 -->
    <transition name="fade">
      <div class="modal" @click="dropVisible = false" v-if="dropVisible"></div>
    </transition>
    <transition name="slide-up-fade">
      <div class="drop-list" v-if="dropVisible">
        <div
          class="drop-item"
          :class="selectedValue === 1 && 'selected'"
          @click="
            () => {
              selectedValue = 1;
              handleShowDrop();
              // 降序排列
              albumData = albumData.sort(
                (a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime()
              );
            }
          "
        >
          最新发布
        </div>
        <div
          class="drop-item"
          :class="selectedValue === 2 && 'selected'"
          @click="
            () => {
              selectedValue = 2;
              handleShowDrop();
              // 升序排列
              albumData = albumData.sort(
                (a, b) => new Date(a.updateDate).getTime() - new Date(b.updateDate).getTime()
              );
            }
          "
        >
          最早发布
        </div>
        <div class="close-btn" @click.stop="dropVisible = false">取消</div>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
// mobile
.mobile-album-wrap {
  width: 100%;
  box-sizing: border-box;

  .album-header-box {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .title {
      font-weight: 600;
      font-size: 20px;
      color: #ffffff;
      line-height: 28px;
      opacity: 0.6;
    }

    .more {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 14px;
      color: #ffffff;
      line-height: 20px;
      cursor: pointer;
    }
  }

  .album-drop-wrapper {
    display: flex;
    align-items: center;
    position: relative;
    margin: 30px 0;
    width: 100%;
    height: 20px;

    .selected-box {
      display: flex;
      align-items: center;
      .txt {
        height: 20px;
        font-weight: 600;
        font-size: 14px;
        color: #fff;
        line-height: 20px;
      }

      .drop-trigger {
        position: relative;
        margin-left: 7px;
        transition: transform 0.35s;

        &.rotate {
          transform: rotate(-180deg);
        }

        .triangle {
          width: 0;
          border-width: 6px 5px;
          border-style: solid;
          border-color: transparent;
          border-top-color: #fff;
          position: relative;
          top: 3px;
        }
      }
    }

    .drop-list {
      position: absolute;
      top: 25px;
      width: 240px;
      background: #000;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      padding: 5px 0;
      z-index: 2;
      -webkit-backdrop-filter: blur(25px);
      backdrop-filter: blur(25px);

      .drop-item {
        padding-left: 20px;
        height: 50px;
        line-height: 50px;
        color: hsla(0, 0%, 100%, 0.6);
        cursor: pointer;

        &.selected {
          color: #fff;
        }

        &:hover {
          background-color: #44d7b6;
          color: #fff;
        }
      }
    }
  }

  .album-content-box {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .content-item {
      .info-box {
        display: flex;
        align-items: center;

        .cover-image {
          position: relative;
          width: 62px;
          height: 62px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          margin-right: 10px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .offline {
            position: absolute;
            left: 0;
            top: 0;
            width: 40px;
            height: 20px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 0px 0px 4px 0px;
            display: flex;
            align-items: center;
            justify-content: center;

            span {
              font-size: 10px;
              font-weight: 600;
              color: #ffffff;
              transform: scale(0.84);
            }
          }
        }

        .info {
          margin-top: 10px;

          .top-area {
            display: flex;

            .freeze-lock,
            .auth-link-abnormal {
              width: 16px;
              height: 16px;
              margin-right: 5px;
            }

            .offline {
              padding: 1px 5px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 13px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 5px;

              span {
                font-size: 10px;
                line-height: 16px;
                font-weight: 500;
                color: #ffffff;
                opacity: 0.8;
              }
            }

            .lock {
              margin-right: 5px;
              cursor: pointer;
            }

            .title {
              font-weight: 600;
              font-size: 14px;
              color: #ffffff;
              line-height: 20px;
              opacity: 0.8;
              cursor: pointer;

              &:hover {
                color: #44d7b6;
                opacity: 1;
              }
            }
          }

          .desc {
            margin-top: 10px;
            display: flex;
            opacity: 0.4;

            .time-box,
            .album-box {
              display: flex;
              align-items: center;

              .icon {
                width: 14px;
                height: 14px;
                margin-right: 5px;
                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
              }

              .time,
              .album {
                font-weight: 400;
                font-size: 12px;
                color: #ffffff;
                line-height: 18px;
              }

              .time {
                margin-right: 10px;
              }
            }
          }
        }

        .more-icon {
          width: 7px;
          height: 13px;
          margin-left: 5px;
          transform: rotate(180deg);
          margin-left: auto;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }

  .modal {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 300;
  }

  .drop-list {
    position: fixed;
    height: 226px;
    text-align: center;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
    z-index: 300;

    .drop-item {
      font-weight: 400;
      font-size: 16px;
      color: #ffffff;
      line-height: 22px;
      padding: 30px 0;
      position: relative;

      &:nth-child(2) {
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        width: 200px;
        margin: 0 auto;
      }

      &.selected {
        color: #44d7b6;
        &::after {
          position: absolute;
          margin-left: 10px;
          top: 50%;
          transform: translateY(-50%);
          content: "";
          width: 12px;
          height: 12px;
          background: url("@/assets/images/selected.png");
          background-size: contain;
          background-repeat: no-repeat;
          display: inline-block;
        }
      }
    }

    .close-btn {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 20px 0;
    }
  }
}
</style>
