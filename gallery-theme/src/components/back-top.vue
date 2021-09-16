<template>
  <transition name="fade">
    <div @click.stop="backToTop()" v-show="topBtnShow"><slot></slot></div>
  </transition>
</template>

<script lang="ts">
import { ref, watch } from "vue";
import { useMyScroll } from "@/utils/hooks";

export default {
  name: "back-top",

  setup() {
    const { scrollTop } = useMyScroll();
    const topBtnShow = ref(false);

    const backToTop = () => {
      document.documentElement.scroll({ top: 0, behavior: "smooth" });
      document.body.scroll({ top: 0, behavior: "smooth" });
    };

    watch(
      () => scrollTop.value,
      (cur) => {
        topBtnShow.value = cur > 300;
      }
    );

    return {
      topBtnShow,
      backToTop,
    };
  },
};
</script>
