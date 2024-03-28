<!-- 页面脚部 -->

<template>
  <!-- mobile -->
  <div class="mobile-footer-wrapper" v-if="inMobile">
    <div
      class="text-btn"
      v-for="(item, index) in freelogEntrances.filter((_, entrancesIndex) => entrancesIndex < 2)"
      :key="item.label"
      @click="toPage(item.url)"
    >
      <i :class="item.label" v-if="index === 0"></i>
      <span v-else>{{ item.label }}</span>
    </div>
  </div>

  <!-- PC -->
  <div class="footer-wrapper" v-if="!inMobile">
    <div class="text-btn" v-for="(item, index) in freelogEntrances" :key="item.label" @click="toPage(item.url)">
      <i :class="item.label" v-if="index === 0"></i>
      <span v-else>{{ item.label }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { freelogEntrances } from "@/api/data";
import { toRefs } from "vue";

export default {
  name: "MyFooter",

  setup() {
    const store = useStore();

    const methods = {
      /** 打开新标签页 */
      toPage(url: string) {
        window.open(url);
      },
    };

    return {
      freelogEntrances,
      ...toRefs(store.state),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
// mobile
.mobile-footer-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 98px;
  background-color: rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;

  .text-btn {
    padding: 0 20px;
    font-size: 14px;
    line-height: 18px;
    color: #999999;

    & + .text-btn {
      border-left: 1px solid rgba(0, 0, 0, 0.15);
    }
  }
}

// PC
.footer-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 58px;
  background-color: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  .text-btn {
    padding: 0 20px;
    font-size: 12px;
    color: #999999;
    cursor: pointer;

    & + .text-btn {
      border-left: 1px solid rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
