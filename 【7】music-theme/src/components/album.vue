<script setup lang="ts">
import { ref } from "vue";
import { freelogApp } from "freelog-runtime";
import { useRouter } from "vue-router";
import { relativeTime } from "@/utils/common.js";
import { useMyPlay, useMyAuth } from "@/utils/hooks";
// 图片
import MoreIcon from "@/assets/images/arrow.png";
import TimeIcon from "@/assets/images/time.png";
import AlbumIcon from "@/assets/images/album.png";
import AuthLinkAbnormal from "@/assets/images/auth-link-abnormal.png";
import type { Exhibit } from "@/interface";
import { useGlobalStore } from "@/store/global";

const props = defineProps<{
  hasHeader: boolean;
  data: Exhibit[];
}>();
const router = useRouter();
const store = useGlobalStore();
const collectionData = ref<Exhibit[]>([]);

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
  <!-- PC -->
  <div class="pc-album-wrap" v-if="!store.inMobile">
    <!-- 专辑头部 -->
    <div class="album-header-box" v-if="props.hasHeader">
      <span class="title">专辑</span>
      <div class="more" @click="router.myPush({ path: '/album-list' })">
        所有专辑
        <div class="more-icon">
          <img :src="MoreIcon" alt="更多" />
        </div>
      </div>
    </div>

    <!-- 专辑内容 -->
    <div class="album-content-box">
      <div
        class="content-item"
        v-for="(item, index) in props.data"
        :key="index"
        @click="router.myPush({ path: '/detail', query: { id: item.exhibitId } })"
      >
        <div class="info-box">
          <div class="cover-image">
            <img :src="item.coverImages[0]" alt="歌曲封面" />
            <div class="btn-modal">
              <div class="btn" @click.stop="playOrPause(item)">
                <!-- <i class="freelog" :class="'fl-icon-bofang-sanjiaoxing'"></i> -->
                <i
                  class="freelog"
                  :class="
                    playing(item.exhibitId) ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'
                  "
                ></i>
              </div>
            </div>
          </div>
          <div class="info">
            <div class="top-area">
              <img
                class="auth-link-abnormal"
                :src="AuthLinkAbnormal"
                v-if="authLinkAbnormal(item.defaulterIdentityType)"
              />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth(item)"
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
                <span class="time">{{ relativeTime(item.updateDate) }}</span>
              </div>

              <div class="album-box">
                <div class="icon">
                  <img :src="AlbumIcon" alt="专辑" />
                </div>
                <span class="album">{{ item.signCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- mobile -->
  <div class="mobile-album-wrap" v-else>
    <!-- 专辑头部 -->
    <div class="album-header-box" v-if="props.hasHeader">
      <span class="title">专辑</span>
      <div class="more" @click="router.myPush({ path: '/album-list' })">
        所有专辑
        <div class="more-icon">
          <img :src="MoreIcon" alt="更多" />
        </div>
      </div>
    </div>

    <!-- 专辑内容 -->
    <div class="album-content-box">
      <div class="content-item" v-for="(item, index) in props.data" :key="index">
        <div class="info-box">
          <div class="cover-image">
            <img :src="item.coverImages[0]" alt="歌曲封面" />
            <div class="btn" @click.stop="playOrPause(item)">
              <!-- <i class="freelog" :class="'fl-icon-bofang-sanjiaoxing'"></i> -->
              <i
                class="freelog"
                :class="playing(item.exhibitId) ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
              ></i>
            </div>
          </div>
          <div class="info">
            <div class="top-area">
              <img
                class="auth-link-abnormal"
                :src="AuthLinkAbnormal"
                v-if="authLinkAbnormal(item.defaulterIdentityType)"
              />
              <i
                class="freelog fl-icon-suoding lock"
                @click.stop="getAuth(item)"
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
                <span class="time">{{ relativeTime(item.updateDate) }}</span>
              </div>

              <div class="album-box">
                <div class="icon">
                  <img :src="AlbumIcon" alt="专辑" />
                </div>
                <span class="album">{{ item.signCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
// PC
.pc-album-wrap {
  width: 100%;
  padding-bottom: 100px;
  box-sizing: border-box;

  .album-header-box {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;

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
      opacity: 0.6;
      line-height: 20px;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }

      .more-icon {
        width: 7px;
        height: 13px;
        margin-left: 5px;
        transform: rotate(180deg);
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .album-content-box {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    min-width: 1100px;

    .content-item {
      .info-box {
        display: flex;
        flex-direction: column;

        .cover-image {
          position: relative;
          width: 232px;
          height: 232px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          overflow: hidden;

          &:hover {
            opacity: 1;

            .btn-modal {
              background: rgba(0, 0, 0, 0.2);

              .btn {
                opacity: 1;
              }
            }
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .btn-modal {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.5s ease;

            .btn {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.4);
              backdrop-filter: blur(1px);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: all 0.5s ease;

              &:hover {
                background: #44d7b6;
              }

              &:active {
                background: rgba(255, 255, 255, 0.4);
              }

              .freelog {
                font-size: 18px;
                color: #fff;

                &.fl-icon-bofang-sanjiaoxing {
                  margin-left: 5px;
                }

                &.fl-icon-zanting {
                  margin-left: 2px;
                }
              }
            }
          }
        }
      }

      .info {
        margin-top: 10px;

        .top-area {
          display: flex;
          .auth-link-abnormal {
            width: 16px;
            height: 16px;
            margin-right: 5px;
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
              text-decoration: underline;
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
    }
  }
}

// mobile
.mobile-album-wrap {
  width: 100%;
  padding: 0 15px 40px;
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
      opacity: 0.6;
      line-height: 20px;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }

      .more-icon {
        width: 7px;
        height: 13px;
        margin-left: 5px;
        transform: rotate(180deg);
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .album-content-box {
    display: flex;
    gap: 30px;
    overflow-x: scroll;
    /* 隐藏滚动条 */
    scrollbar-width: none; /* firefox */
    -ms-overflow-style: none; /* IE 10+ */
    &::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }

    .content-item {
      .info-box {
        display: flex;
        flex-direction: column;

        .cover-image {
          position: relative;
          width: 210px;
          height: 210px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          margin-right: 15px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .btn {
            position: absolute;
            bottom: 10px;
            left: 10px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(1px);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.5s ease;

            &:active {
              background: rgba(255, 255, 255, 0.4);
            }

            .freelog {
              font-size: 18px;
              color: #fff;

              &.fl-icon-bofang-sanjiaoxing {
                margin-left: 5px;
              }

              &.fl-icon-zanting {
                margin-left: 2px;
              }
            }
          }
        }
      }

      .info {
        margin-top: 10px;

        .top-area {
          display: flex;
          .auth-link-abnormal {
            width: 16px;
            height: 16px;
            margin-right: 5px;
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
              text-decoration: underline;
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
    }
  }
}
</style>
