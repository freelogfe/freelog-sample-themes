<script setup lang="ts">
import { useGlobalStore } from "@/store/global";

import VisitIcon from "@/assets/images/head-phone.png";

const store = useGlobalStore();
</script>

<template>
  <div class="home-banner-wrap">
    <!-- 节点封面 -->
    <div class="node-banner">
      <img
        src="https://fastly.picsum.photos/id/617/1440/660.jpg?hmac=FUdnWol-2hYf4N9nyQ7G_KkHWeon3TjgnQPPhIfSGgA"
        alt="节点封面"
      />
    </div>

    <!-- 节点信息 -->
    <div class="node-info">
      <div class="avatar">
        <img
          src="https://fastly.picsum.photos/id/886/170/170.jpg?hmac=pS3kuW8yXp5t8UX3v-vMkM3wA0fcbAeeSyo9NyUIQqs"
          alt="avatar"
        />
      </div>
      <div class="node-name">节点名称</div>
      <div class="node-desc-box">
        <div class="node-desc">{{ store.selfConfig?.options_node_intro1 || "" }}</div>
        <div class="node-desc">{{ store.selfConfig?.options_node_intro2 || "" }}</div>
        <div class="node-desc">{{ store.selfConfig?.options_node_intro3 || "" }}</div>
      </div>
      <div class="node-visit">
        <div class="visit-icon">
          <img :src="VisitIcon" alt="访问量" />
        </div>
        <span class="visit-count">{{ "XX" }}W</span>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.home-banner-wrap {
  margin-top: -98px;
  width: 100%;

  .node-banner {
    width: 100%;
    height: 660px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .node-info {
    position: absolute;
    left: 80px;
    top: 188px;

    .avatar {
      width: 170px;
      height: 170px;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .node-name {
      padding-top: 25px;
      height: 60px;
      font-weight: 600;
      font-size: 40px;
      color: #ffffff;
      line-height: 60px;
      opacity: 0.8;
    }

    .node-desc-box {
      padding: 25px 0;
      .node-desc {
        margin-bottom: 15px;
        opacity: 0.6;
      }
    }

    .node-visit {
      display: flex;
      align-items: center;

      .visit-icon {
        width: 18px;
        height: 18px;
        margin-right: 5px;
        img {
          width: 100%;
          height: 100%;
        }
      }

      .visit-count {
        font-weight: 400;
        font-size: 14px;
        color: #ffffff;
        line-height: 20px;
        opacity: 0.6;
      }
    }
  }
}
</style>
