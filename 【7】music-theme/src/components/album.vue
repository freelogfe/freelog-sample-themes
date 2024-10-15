<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { freelogApp } from "freelog-runtime";
import { useRouter, useRoute } from "vue-router";
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
const route = useRoute();
const router = useRouter();
const store = useGlobalStore();
const albumData = ref<Exhibit[]>(
  props.data.sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
);
const collectionData = ref<Exhibit[]>([]);
const dropVisible = ref<boolean>(false);
const selectedValue = ref<number>(1); // 1-最新发布 2-最早发布
const dropWrapper = ref<HTMLElement | null>(null);

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
  await useMyPlay.playOrPause(collectionData.value[0], "normal");

  setTimeout(async () => {
    await useMyPlay.addToPlayList({
      exhibitId: item.exhibitId,
      type: "PLAY_ALBUM_ADD_TO_PLAYLIST"
    });
  }, 0);
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

const handleShowDrop = () => {
  dropVisible.value = !dropVisible.value;
};

// 定义点击外部的处理函数
const handleClickOutside = (event: MouseEvent) => {
  if (dropWrapper.value && !dropWrapper.value.contains(event.target as Node)) {
    dropVisible.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
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
    <div v-if="route.name === 'album-list'">
      <!-- 最新发布 | 最早发布 -->
      <div class="album-drop-wrapper" ref="dropWrapper">
        <div class="selected-box" @click="handleShowDrop">
          <div class="txt">{{ selectedValue === 1 ? "最新发布" : "最早发布" }}</div>
          <div class="drop-trigger" :class="dropVisible ? 'rotate' : ''">
            <div class="triangle"></div>
          </div>
        </div>
        <div class="drop-list" v-show="dropVisible">
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
        </div>
      </div>
    </div>
    <!-- 专辑内容 -->
    <div class="album-content-box" v-if="albumData.length">
      <div
        class="content-item"
        v-for="(item, index) in albumData"
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

    <div class="no-data" v-else>暂无任何专辑</div>
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
    <div class="album-content-box" v-if="albumData.length">
      <div class="content-item" v-for="(item, index) in albumData" :key="index">
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
    <div class="no-data" v-else>暂无任何专辑</div>
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

  .album-drop-wrapper {
    display: flex;
    align-items: center;
    position: relative;
    margin: 40px 0;
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
                font-size: 26px;
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

  .no-data {
    padding: 122px 0 152px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 30px;
    color: #ffffff;
    line-height: 36px;
    opacity: 0.4;
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

  .no-data {
    padding: 70px 0 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 24px;
    color: #ffffff;
    line-height: 40px;
    opacity: 0.4;
  }
}
</style>
