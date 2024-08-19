<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useGlobalStore } from "@/store/global";

// import VisitIcon from "@/assets/images/head-phone.png";
import PcDefaultBanner from "@/assets/images/pc-default-banner.webp";
import MobileDefaultBanner from "@/assets/images/mobile-default-banner.webp";

const store = useGlobalStore();

const { selfConfig } = storeToRefs(store);
</script>

<template>
  <!-- PC -->
  <div class="pc-home-banner-wrap" v-if="!store.inMobile">
    <!-- 节点封面 -->
    <div class="node-banner">
      <img :src="selfConfig.options_node_banner || PcDefaultBanner" alt="节点封面" />
    </div>

    <!-- 节点信息 -->
    <div class="node-info">
      <div class="avatar">
        <img :src="selfConfig.options_node_logo" alt="avatar" />
      </div>
      <div class="node-name">{{ selfConfig.options_node_name || "" }}</div>
      <div class="node-desc-box">
        <div class="node-desc">{{ selfConfig.options_node_intro1?.slice(0, 70) || "" }}</div>
        <div class="node-desc">{{ selfConfig.options_node_intro2?.slice(0, 70) || "" }}</div>
        <div class="node-desc">{{ selfConfig.options_node_intro3?.slice(0, 70) || "" }}</div>
      </div>
      <!-- <div class="node-visit">
        <div class="visit-icon">
          <img :src="VisitIcon" alt="访问量" />
        </div>
        <span class="visit-count">访问量{{ "XX" }}W</span>
      </div> -->
    </div>
  </div>

  <!-- mobile -->
  <div class="mobile-home-banner-wrap" v-else>
    <!-- 节点封面 -->
    <div class="node-banner">
      <img :src="selfConfig.options_node_banner || MobileDefaultBanner" alt="节点封面" />
    </div>

    <!-- 节点信息 -->
    <div class="node-info">
      <div class="avatar">
        <img :src="selfConfig.options_node_logo" alt="avatar" />
      </div>
      <div class="node-name">{{ selfConfig.options_node_name || "节点名称" }}</div>
      <div class="node-desc-box">
        <div class="node-desc">{{ selfConfig.options_node_intro1 || "" }}</div>
        <div class="node-desc">{{ selfConfig.options_node_intro2 || "" }}</div>
        <div class="node-desc">{{ selfConfig.options_node_intro3 || "" }}</div>
      </div>
      <!-- <div class="node-visit">
        <div class="visit-icon">
          <img :src="VisitIcon" alt="访问量" />
        </div>
        <span class="visit-count">访问量{{ "XX" }}W</span>
      </div> -->
    </div>
  </div>
</template>

<style lang="less" scoped>
// PC
.pc-home-banner-wrap {
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
    left: calc((100% - 1280px) / 2);
    top: 188px;

    .avatar {
      width: 170px;
      height: 170px;
      border-radius: 50%;
      background-color: #d8d8d8;
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

// mobile
.mobile-home-banner-wrap {
  width: 100%;

  .node-banner {
    width: 100%;
    height: 180px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .node-info {
    margin-top: -50px;
    padding: 0 15px;

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #d8d8d8;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .node-name {
      padding-top: 25px;
      height: 36px;
      font-weight: 600;
      font-size: 30px;
      color: #ffffff;
      line-height: 36px;
      opacity: 0.8;
    }

    .node-desc-box {
      padding: 20px 0;
      .node-desc {
        margin-bottom: 5px;
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
