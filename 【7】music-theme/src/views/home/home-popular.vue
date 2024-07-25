<script setup lang="ts">
import { ref } from "vue";
import { useGlobalStore } from "@/store/global";

import MoreIcon from "@/assets/images/arrow.png";

const store = useGlobalStore();

const popularData = ref<any[]>([1, 2, 3, 4, 5, 6, 7]);

const changeIndex = (index: number): string => {
  if (index > 1 && index < 10) {
    return index.toString().padStart(2, "0");
  }
  return index.toString();
};
</script>

<template>
  <div class="home-popular-wrap">
    <!-- 热门头部 -->
    <div class="popular-header-box">
      <span class="title">热门音乐</span>
      <div class="more">
        所有音乐
        <div class="more-icon">
          <img :src="MoreIcon" alt="更多" />
        </div>
      </div>
    </div>

    <!-- 热门内容 -->
    <div class="popular-content-box">
      <div class="content-item" v-for="(item, index) in popularData" :key="index">
        <div class="index">{{ changeIndex(index + 1) }}</div>
        <div class="info-box">
          <div class="cover-image">
            <img
              src="https://fastly.picsum.photos/id/886/170/170.jpg?hmac=pS3kuW8yXp5t8UX3v-vMkM3wA0fcbAeeSyo9NyUIQqs"
              alt="歌曲封面"
              srcset=""
            />
          </div>
          <div class="info">
            <span class="title">夏日的清晨，阳光洒在大地上，微风轻拂，给人带来宁静</span>
            <span class="desc">夏日的清晨，阳光洒在大地上，微风轻拂，给人带来宁静</span>
            <span class="type" :class="true && 'album'">单曲 | 合集名字</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.home-popular-wrap {
  width: 100%;
  padding: 60px 80px;
  box-sizing: border-box;

  .popular-header-box {
    display: flex;
    justify-content: space-between;

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

  .popular-content-box {
    display: flex;
    flex-wrap: wrap;
    gap: 40px 30px;
    min-width: 1100px;
    margin-top: 40px;

    .content-item {
      display: flex;
      min-width: 340px;
      max-width: 400px;

      .index {
        width: 40px;
        font-weight: 600;
        font-size: 16px;
        color: #ffffff;
        line-height: 22px;
        text-align: left;
        opacity: 0.2;
      }

      .info-box {
        display: flex;
        align-items: center;

        .cover-image {
          width: 70px;
          height: 70px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          margin-right: 15px;
          overflow: hidden;
          cursor: pointer;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .info {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .title {
            width: 275px;
            font-weight: 600;
            font-size: 16px;
            color: #ffffff;
            line-height: 22px;
            opacity: 0.8;
            cursor: pointer;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            &:hover {
              color: #44d7b6;
            }
          }

          .desc {
            width: 275px;
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            line-height: 18px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .type {
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            line-height: 18px;
            opacity: 0.4;

            &.album {
              cursor: pointer;

              &:hover {
                color: #44d7b6;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 1440px) {
  .home-popular-wrap {
    .popular-content-box {
      .title,
      .desc {
        width: 215px !important;
      }
    }
  }
}
</style>
