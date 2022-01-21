<template>
  <div class="detail-wrapper">
    <my-header />

    <!-- mobile -->
    <div class="mobile-content" v-if="inMobile">
      <!-- 书籍信息 -->
      <div class="comic-info">
        <div class="comic-base-info">
          <div class="comic-cover">
            <img
              class="comic-cover-image"
              :src="comicInfo?.coverImages[0]"
              :alt="comicInfo?.exhibitTitle"
              v-if="comicInfo?.coverImages"
            />
          </div>

          <div class="comic-content">
            <div class="content-top">
              <div class="comic-name">{{ comicInfo?.exhibitTitle }}</div>

              <div class="comic-author">
                {{ comicInfo?.articleInfo?.articleOwnerName }}
              </div>

              <div class="tags">
                <tags :tags="comicInfo?.tags" />
              </div>
            </div>

            <div class="content-bottom">
              <div class="sign-count">{{ comicInfo?.signCount }}人签约</div>
              <div class="share-btn" @click="share()">
                <span class="share-btn-text">
                  <i class="freelog fl-icon-fenxiang"></i>
                  分享给更多人
                </span>
              </div>
              <input id="href" class="hidden-input" :value="href" readOnly />
            </div>
          </div>
        </div>

        <div class="comic-date-info">
          <div class="date-info">创建时间：{{ formatDate(comicInfo?.createDate) }}</div>

          <div class="date-info">最近更新：{{ formatDate(comicInfo?.updateDate) }}</div>
        </div>

        <div class="operate-btns">
          <div class="btn main-btn mobile" @click="switchPage('/reader', { id: comicInfo?.exhibitId })">
            立即阅读
          </div>
          <div class="btn" :class="isCollected ? 'delete' : 'collect'" @click="operateShelf(comicInfo)">
            {{ isCollected ? "取消收藏" : "加入收藏" }}
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 书籍简介 -->
      <div class="comic-intro">
        <div class="intro-title">内容简介</div>

        <div class="intro" :class="introState === 1 ? 'fold' : 'unfold'" v-if="comicInfo?.versionInfo?.exhibitProperty?.intro">
          <div ref="introContent" class="intro-content">
            {{ comicInfo?.versionInfo?.exhibitProperty?.intro }}
          </div>

          <div class="view-all-btn" @click="introState = 3" v-if="introState === 1">
            ...查看全部
          </div>
        </div>
          <div class="no-intro-tip" v-else>暂无简介</div>
      </div>

      <!-- 书籍目录 -->
      <!-- <div class="directory-list">
        <div class="directory-header">
          <div class="directory-title">目录</div>
          <div class="view-all-btn" @click="directoryShow = true">
            全部{{ directory.length }}
            <i class="freelog fl-icon-zhankaigengduo"></i>
          </div>
        </div>

        <div class="directory-list-box">
          <div
            class="directory-item"
            v-for="(item, index) in directory.filter((_, index) => index < 5)"
            :key="item + index"
          >
            <div class="item-content">
              <div class="directory-title">{{ item }}</div>
              <i class="freelog fl-icon-zhankaigengduo"></i>
            </div>
          </div>
        </div>
      </div> -->
    </div>

    <!-- PC -->
    <div class="content" v-if="!inMobile">
      <div class="content-box">
        <!-- 书籍信息 -->
        <div class="comic-info">
          <div class="comic-cover">
            <img
              class="comic-cover-image"
              :src="comicInfo?.coverImages[0]"
              :alt="comicInfo?.exhibitTitle"
              v-if="comicInfo?.coverImages"
            />
          </div>

          <div class="comic-content">
            <div class="comic-name">{{ comicInfo?.exhibitTitle }}</div>

            <div class="comic-author">
              {{ comicInfo?.articleInfo?.articleOwnerName }}
            </div>

            <div class="tags">
              <tags :tags="comicInfo?.tags" />
            </div>

            <div class="create-date">创建时间：{{ formatDate(comicInfo?.createDate) }}</div>

            <div class="update-date">最近更新：{{ formatDate(comicInfo?.updateDate) }}</div>

            <div class="btns-box">
              <div class="operate-btns">
                <div class="btn main-btn" @click="switchPage('/reader', { id: comicInfo?.exhibitId })">
                  立即阅读
                </div>
                <div class="btn" :class="isCollected ? 'warning-btn' : 'collect'" @click="operateShelf(comicInfo)">
                  {{ isCollected ? "取消收藏" : "加入收藏" }}
                </div>
              </div>

              <div class="other-btns">
                <div class="sign-count">{{ comicInfo?.signCount }}人签约</div>
                <div class="share-btn" @mouseover="shareShow = true" @mouseleave="shareShow = false">
                  <span class="share-btn-text" :class="{ active: shareShow }">
                    <i class="freelog fl-icon-fenxiang"></i>
                    分享给更多人
                  </span>

                  <share :show="shareShow" :exhibit="comicInfo" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 书籍简介 -->
        <div class="comic-intro">
          <div class="intro-title">内容简介</div>

          <div
            class="intro"
            :class="introState === 1 ? 'fold' : 'unfold'"
            v-if="comicInfo?.versionInfo?.exhibitProperty?.intro"
          >
            <div ref="introContent" class="intro-content">
              {{ comicInfo?.versionInfo?.exhibitProperty?.intro }}
            </div>

            <div class="view-all-btn" @click="introState = 3" v-if="introState === 1">
              ...查看全部
            </div>
          </div>
          <div class="no-intro-tip" v-else>暂无简介</div>
        </div>

        <!-- 书籍目录 -->
        <!-- <div class="directory-list">
          <div class="directory-title">
            目录
            <span class="directory-length">({{ directory.length }}章)</span>
          </div>

          <div class="directory-list-box">
            <div class="directory-item" v-for="(item, index) in directory" :key="item + index">
              <div class="directory-title">{{ item }}</div>
              <div class="directory-status">已授权</div>
            </div>
          </div>

          <div class="no-more">— 已加载全部章节 —</div>
        </div> -->
      </div>
    </div>

    <my-footer />

    <theme-entrance />

    <directory :show="directoryShow" :comicInfo="comicInfo" @closeDirectory="directoryShow = false" />
  </div>
</template>

<script lang="ts">
import { useMyRouter, useMyShelf } from "../utils/hooks";
import { defineAsyncComponent, reactive, ref, toRefs, watch } from "@vue/runtime-core";
import { ExhibitItem } from "@/api/interface";
import { getExhibitInfo, getExhibitSignCount } from "@/api/freelog";
import { useStore } from "vuex";
import { formatDate, showToast } from "@/utils/common";
import { watchEffect } from "vue";

export default {
  name: "detail",

  components: {
    "my-header": defineAsyncComponent(() => import("../components/header.vue")),
    "my-footer": defineAsyncComponent(() => import("../components/footer.vue")),
    "theme-entrance": defineAsyncComponent(() => import("../components/theme-entrance.vue")),
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
    share: defineAsyncComponent(() => import("../components/share.vue")),
    directory: defineAsyncComponent(() => import("../components/directory.vue")),
  },

  setup() {
    const store = useStore();
    const { query, switchPage, routerBack } = useMyRouter();
    const { id } = query.value;
    const { isCollected, operateShelf } = useMyShelf(id);
    const introContent = ref<any>();

    const data = reactive({
      comicInfo: {} as ExhibitItem,
      directoryShow: false,
      directory: [] as string[],
      shareShow: false,
      introState: 0,
      href: "",
    });

    const methods = {
      share() {
        // 复制链接
        const input: any = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
      },
    };

    watchEffect(() => {
      document.body.style.overflowY = data.directoryShow ? "hidden" : "auto";
    });

    const getComicInfo = async (id: string) => {
      const exhibitInfo = await getExhibitInfo(id, {
        isLoadVersionProperty: 1,
      });
      const signCountData = await getExhibitSignCount(id);
      data.comicInfo = {
        ...exhibitInfo.data.data,
        signCount: signCountData?.data.data[0]?.count,
      };
      data.directory = Array.from({ length: 12 }, () => data.comicInfo.exhibitTitle || "目录名称");
      data.href = (window.location as any).currentURL;
    };
    getComicInfo(id);

    watch(
      () => introContent.value,
      () => {
        const introHeight = introContent.value.clientHeight;
        const foldHeight = store.state.inMobile ? 120 : 60;
        if (introHeight > foldHeight) data.introState = 1;
      }
    );

    return {
      formatDate,
      ...store.state,
      switchPage,
      routerBack,
      isCollected,
      operateShelf,
      introContent,
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.detail-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  // mobile
  .mobile-content {
    width: 100%;
    padding-bottom: 98px;

    .comic-info {
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
      background-color: #fff;

      .comic-base-info {
        display: flex;

        .comic-cover {
          width: 110px;
          height: 154px;
          background-color: #b7b7b7;
          border-radius: 4px;
          box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
          margin-right: 15px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;

          .comic-cover-image {
            height: 100%;
          }
        }

        .comic-content {
          flex: 1;
          width: 0;
          display: flex;
          flex-direction: column;

          .content-top {
            flex: 1;

            .comic-name {
              font-size: 20px;
              line-height: 26px;
              color: #222222;
              font-weight: bold;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              overflow: hidden;
            }

            .comic-author {
              font-size: 13px;
              line-height: 18px;
              color: #666666;
              margin-top: 10px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }

            .tags {
              margin-top: 12px;
              height: 24px;
              overflow: hidden;
            }
          }

          .content-bottom {
            display: flex;
            align-items: center;

            .sign-count {
              font-size: 14px;
              line-height: 20px;
              color: #222222;
            }

            .share-btn {
              position: relative;
              display: flex;
              align-items: center;
              margin-left: 20px;

              .share-btn-text {
                font-size: 14px;
                line-height: 20px;
                color: #999999;

                &:active {
                  color: #666666;
                }

                .fl-icon-fenxiang {
                  margin-right: 6px;
                }
              }
            }

            .hidden-input {
              position: absolute;
              z-index: -1;
            }
          }
        }
      }

      .comic-date-info {
        width: 100%;
        padding: 10px 0;
        background-color: rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20px 0;

        .date-info {
          font-size: 12px;
          color: #999999;
          line-height: 18px;

          & + .date-info {
            margin-top: 5px;
          }
        }
      }

      .operate-btns {
        display: flex;

        .btn {
          flex: 1;
          height: 48px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;

          & + .btn {
            margin-left: 10px;
          }

          &.delete {
            background: #fdebec;
            color: #ee4040;

            &:active {
              background: #ffe2e4;
            }
          }

          &.collect {
            background: #edf6ff;
            color: #2784ff;

            &:active {
              background: #e1f0ff;
            }
          }
        }
      }
    }

    .divider {
      width: 100%;
      height: 5px;
      background-color: rgba(0, 0, 0, 0.03);
    }

    .comic-intro {
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
      background-color: #fff;

      .intro-title {
        font-size: 16px;
        line-height: 22px;
        color: #222222;
        font-weight: bold;
      }

      .intro {
        position: relative;
        overflow: hidden;
        margin-top: 20px;

        &.fold {
          height: 120px;
        }

        &.unfold {
          height: auto;
        }

        .intro-content {
          font-size: 14px;
          line-height: 24px;
          color: #222222;
          text-indent: 28px;
        }

        .view-all-btn {
          position: absolute;
          right: 0;
          bottom: 0;
          background-color: #fff;
          line-height: 24px;
          color: #2784ff;

          &:active {
            color: #539dff;
          }
        }
      }

      .no-intro-tip {
        font-size: 14px;
        color: #999999;
        line-height: 24px;
        margin-top: 20px;
      }
    }

    .directory-list {
      width: 100%;
      padding-bottom: 20px;
      background-color: #fff;
      margin-top: 5px;

      .directory-header {
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;

        .directory-title {
          font-size: 16px;
          font-weight: bold;
          color: #222222;
          line-height: 22px;
        }

        .view-all-btn {
          font-size: 16px;
          color: #666666;
          line-height: 22px;
          display: flex;
          align-items: center;

          &:active {
            color: #222222;
          }

          .fl-icon-zhankaigengduo {
            width: 6px;
            height: 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
          }
        }
      }

      .directory-list-box {
        display: flex;
        flex-direction: column;

        .directory-item {
          width: 100%;
          padding: 0 20px;
          box-sizing: border-box;

          &:last-child .item-content {
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }

          &:active {
            background-color: rgba(0, 0, 0, 0.02);
          }

          .item-content {
            width: 100%;
            height: 50px;
            display: flex;
            align-items: center;
            border-top: 1px solid rgba(0, 0, 0, 0.1);

            .directory-title {
              font-size: 14px;
              color: #222222;
              line-height: 20px;
              flex: 1;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }

            .fl-icon-zhankaigengduo {
              width: 6px;
              height: 12px;
              font-size: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 50px;
            }
          }
        }
      }

      .no-more {
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        margin-top: 30px;
        text-align: center;
      }
    }
  }

  // PC
  .content {
    width: 1160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 40px;
    padding-bottom: 148px;

    .content-box {
      width: 920px;

      .comic-info {
        display: flex;
        padding-bottom: 30px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);

        .comic-cover {
          width: 140px;
          height: 196px;
          background-color: #b7b7b7;
          box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          margin-right: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;

          .comic-cover-image {
            height: 100%;
          }
        }

        .comic-content {
          flex: 1;

          .comic-name {
            font-size: 24px;
            line-height: 30px;
            color: #222222;
            font-weight: bold;
          }

          .comic-author {
            font-size: 13px;
            line-height: 18px;
            color: #666666;
            margin-top: 10px;
          }

          .tags {
            margin-top: 12px;
            height: 24px;
            overflow: hidden;
          }

          .create-date {
            font-size: 12px;
            line-height: 18px;
            color: #999999;
            margin-top: 12px;
          }

          .update-date {
            font-size: 12px;
            line-height: 18px;
            color: #999999;
            margin-top: 4px;
          }

          .btns-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 12px;

            .operate-btns {
              display: flex;

              .btn {
                padding: 0 20px;
                height: 38px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;

                & + .btn {
                  margin-left: 10px;
                }

                &.delete {
                  background: #fdebec;
                  color: #ee4040;
                  cursor: pointer;
                  transition: all 0.2s linear;

                  &:hover {
                    background: #ffe2e4;
                  }
                }

                &.collect {
                  background: #edf6ff;
                  color: #2784ff;
                  cursor: pointer;
                  transition: all 0.2s linear;

                  &:hover {
                    background: #e1f0ff;
                  }
                }
              }
            }

            .other-btns {
              display: flex;
              align-items: center;

              .sign-count {
                font-size: 14px;
                color: #222222;
              }

              .share-btn {
                position: relative;
                display: flex;
                align-items: center;
                margin-left: 30px;
                cursor: pointer;

                .share-btn-text {
                  font-size: 14px;
                  color: #999999;
                  transition: all 0.2s linear;

                  &:hover,
                  &.active {
                    color: #222222;
                  }

                  .fl-icon-fenxiang {
                    margin-right: 6px;
                  }
                }
              }
            }
          }
        }
      }
    }

    .comic-intro {
      padding: 25px 0;
      // border-bottom: 1px solid rgba(0, 0, 0, 0.1);

      .intro-title {
        font-size: 16px;
        line-height: 22px;
        color: #222222;
        font-weight: bold;
      }

      .intro {
        position: relative;
        overflow: hidden;
        margin-top: 25px;

        &.fold {
          height: 60px;
        }

        &.unfold {
          height: auto;
        }

        .intro-content {
          font-size: 14px;
          line-height: 20px;
          color: #222222;
          text-indent: 28px;
        }

        .view-all-btn {
          position: absolute;
          right: 0;
          bottom: 0;
          background-color: #fff;
          line-height: 20px;
          color: #2784ff;
          cursor: pointer;

          &:hover {
            color: #539dff;
          }

          &:active {
            color: #2376e5;
          }
        }
      }

      .no-intro-tip {
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        margin-top: 25px;
      }
    }

    .directory-list {
      padding-top: 24px;

      .directory-title {
        font-size: 16px;
        font-weight: 600;
        color: #222222;
        line-height: 22px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        .directory-length {
          font-weight: 400;
          color: #999999;
          margin-left: 10px;
        }
      }

      .directory-list-box {
        display: flex;
        flex-wrap: wrap;

        .directory-item {
          width: calc((100% - 80px) / 3);
          padding: 15px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          margin-right: 40px;

          &:nth-child(3n) {
            margin-right: 0;
          }

          .directory-title {
            font-size: 14px;
            color: #222222;
            line-height: 20px;
            cursor: pointer;
            flex: 1;
          }

          .directory-status {
            width: 60px;
            font-size: 14px;
            color: #ee4040;
            line-height: 20px;
            text-align: right;
          }
        }
      }

      .no-more {
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        margin-top: 30px;
        text-align: center;
      }
    }
  }
}
</style>
