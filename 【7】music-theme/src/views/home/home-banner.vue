<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useGlobalStore } from "@/store/global";

// import VisitIcon from "@/assets/images/head-phone.png";
import PcDefaultBanner from "@/assets/images/pc-default-banner.webp";
import MobileDefaultBanner from "@/assets/images/mobile-default-banner.webp";

const store = useGlobalStore();
const { selfConfig, nodeInfo } = storeToRefs(store);
const currentBanner = ref("");

watch(
  () => selfConfig.value.options_node_banner,
  newBanner => {
    console.log("newBanner", newBanner);
    if (newBanner) {
      currentBanner.value = newBanner;
    } else {
      currentBanner.value = PcDefaultBanner;
    }
  },
  { immediate: true, deep: true }
);

const resizeBanner = () => {
  if (!store.inMobile) {
    const banner = document.querySelector(".node-banner") as HTMLElement;
    const width = window.innerWidth;
    const height = (760 / 1920) * width; // 根据 1920x660 的比例设置高度
    banner.style.height = `${height}px`;
  }
};

// 页面加载时和窗口大小调整时调用
window.addEventListener("load", resizeBanner);
window.addEventListener("resize", resizeBanner);

onMounted(() => {
  resizeBanner();
});
</script>

<template>
  <!-- PC -->
  <div
    class="pc-home-banner-wrap"
    v-if="!store.inMobile"
    :style="{ marginTop: store.nodeInfo.nodeLogo ? '-158px' : '-98px' }"
  >
    <!-- 节点封面 -->
    <div class="node-banner" :class="selfConfig.options_node_banner && 'background-shadow'">
      <img :src="currentBanner" alt="节点封面" />
    </div>

    <!-- 节点信息 -->
    <div
      class="node-info"
      :style="{
        height: store.nodeInfo.nodeLogo ? ` calc(100% - 158px)` : `calc(100% - 98px)`
      }"
    >
      <div class="avatar" v-if="selfConfig.options_node_logo">
        <img :src="selfConfig.options_node_logo" alt="avatar" />
      </div>
      <div class="node-name">{{ nodeInfo.nodeTitle || "" }}</div>
      <div class="node-desc-box">
        <div class="node-desc">
          {{ nodeInfo.nodeShortDescription?.slice(0, 70) || "" }}
        </div>
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
      <div class="avatar" v-if="selfConfig.options_node_logo">
        <img :src="selfConfig.options_node_logo" alt="avatar" />
      </div>
      <div class="node-name">
        {{ nodeInfo.nodeTitle || "" }}
      </div>
      <div class="node-desc-box">
        <div class="node-desc">
          {{ nodeInfo.nodeShortDescription?.slice(0, 70) || "" }}
        </div>
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
  position: relative;
  // margin-top: -98px;
  width: 100%;

  .node-banner {
    width: 100%;
    height: auto;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.background-shadow {
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%);
      }
    }
  }

  .node-info {
    position: absolute;
    // height: calc(100% - 98px);
    left: calc((100% - 1280px) / 2);
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

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
      width: 1280px;
      padding-top: 20px;
      height: 60px;
      font-weight: 600;
      font-size: 40px;
      color: #ffffff;
      line-height: 60px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      opacity: 0.8;
    }

    .node-desc-box {
      padding: 20px 0;
      .node-desc {
        white-space: pre-wrap;
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
      width: 300px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
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

// 响应式布局
@media screen and (max-width: 1500px) {
  .pc-home-banner-wrap .node-info .avatar {
    width: 130px;
    height: 130px;
  }
}
</style>
