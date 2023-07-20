<!-- 回到顶部控件 -->

<template>
  <transition name="fade">
    <div @click="scrollToTop()" v-show="topBtnShow"><slot></slot></div>
  </transition>
</template>

<script lang="ts">
import { ref, watch } from "vue";
import { useMyScroll } from "../utils/hooks";

export default {
  name: "back-top",

  setup() {
    const { scrollTop, scrollToTop } = useMyScroll();
    const topBtnShow = ref(false);

    watch(
      () => scrollTop.value,
      (cur) => {
        topBtnShow.value = cur > 300;
      }
    );

    return {
      topBtnShow,
      scrollToTop,
    };
  },
};
</script>
