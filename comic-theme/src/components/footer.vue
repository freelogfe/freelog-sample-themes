<template>
  <!-- mobile -->
  <div class="mobile-footer-wrapper" v-if="inMobile">
    <div
      class="second-text-btn mobile"
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
</template>

<script lang="ts">
import { useStore } from "vuex";
import { freelogEntrances } from "@/api/data";

export default {
  name: "my-footer",

  setup() {
    const store = useStore();

    const methods = {
      // 跳转相应页面
      toPage(url: string) {
        window.open(url);
      },
    };

    return {
      freelogEntrances,
      ...store.state,
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

  .second-text-btn {
    font-size: 14px;
    line-height: 18px;
  }
}

// PC
.footer-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 48px;
  background-color: #fafbfc;
  display: flex;
  align-items: center;
  justify-content: center;

  .second-text-btn {
    font-size: 12px;
  }
}

.second-text-btn {
  padding: 0 20px;

  & + .second-text-btn {
    border-left: 1px solid rgba(0, 0, 0, 0.15);
  }
}
</style>
