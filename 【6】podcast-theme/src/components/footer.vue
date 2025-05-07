<!-- 页面脚部 -->

<template>
  <div class="footer-wrapper">
    <!-- mobile -->
    <div class="mobile-footer-wrapper" v-if="$store.state.inMobile">
      <div class="btns-area">
        <div
          class="second-text-btn mobile"
          v-for="(item, index) in freelogEntrances.filter(
            (_, entrancesIndex) => entrancesIndex < 2
          )"
          :key="item.label"
          @click="toPage(item.url)"
        >
          <i :class="item.label" v-if="index === 0"></i>
          <span v-else>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- PC -->
    <div class="pc-footer-wrapper" v-if="$store.state.inMobile === false">
      <div
        class="second-text-btn"
        v-for="(item, index) in freelogEntrances"
        :key="item.label"
        @click="toPage(item.url)"
      >
        <i :class="item.label" v-if="index === 0"></i>
        <span v-else>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { freelogEntrances } from "@/api/data";

export default {
  name: "my-footer",

  data() {
    return {
      freelogEntrances
    };
  },

  methods: {
    /** 打开新标签页 */
    toPage(url) {
      window.open(url);
    }
  }
};
</script>

<style lang="scss" scoped>
.footer-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: var(--text-point-third-color);
  z-index: 100;

  // mobile
  .mobile-footer-wrapper {
    width: 100%;
    height: 238px;
    background-color: rgba(255, 255, 255, 0.02);

    .btns-area {
      width: 100%;
      height: 98px;
      display: flex;
      align-items: center;
      justify-content: center;

      .second-text-btn {
        color: var(--text-color);
        font-size: 14px;
        line-height: 18px;
      }
    }
  }

  // PC
  .pc-footer-wrapper {
    width: 100%;
    height: 48px;
    background: rgba(255, 255, 255, 0.03);
    display: flex;
    align-items: center;
    justify-content: center;

    .second-text-btn {
      font-size: 12px;
      color: var(--text-color);
      opacity:0.3;      
    }
  }
}

.second-text-btn {
  padding: 0 20px;

  & + .second-text-btn {
    border-left: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
