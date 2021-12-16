<template>
  <div
    class="frame-wrapper"
    @mouseover="modalShow = true"
    @mouseleave="modalShow = false"
  >
    <img class="image" :style="{ height: data.height + 'px' }" v-lazy="data.coverImages[0]" v-if="data.isAuth" />
    <div
      class="filter-modal"
      :style="{ height: data.height + 'px', '--url': 'url(' + data.coverImages[0] + ')' }"
      v-else
    ></div>

    <transition name="fade">
      <div class="modal" v-if="modalShow">
        <span class="title">{{ data.exhibitName }}{{data.height}}</span>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { ref } from "@vue/reactivity";

export default {
  name: "frame",

  props: ["data"],

  setup() {
    const modalShow = ref(false);

    return {
      modalShow,
    };
  },
};
</script>

<style lang="scss" scoped>
.frame-wrapper {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;

  .image {
    width: 100%;
  }

  .filter-modal {
  position: relative;
    width: 100%;
    box-shadow: 0 10px 20px rgb(0 0 0 / 50%);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      -webkit-filter: blur(5px);
      -moz-filter: blur(5px);
      -ms-filter: blur(5px);
      -o-filter: blur(5px);
      filter: blur(5px);
      margin: -5px;
      background-image: var(--url);
      background-size: cover;
    }
  }

  .modal {
    position: absolute;
    inset: 0;
    padding: 20px;
    box-sizing: border-box;
    background: linear-gradient(
      180deg,
      transparent 62%,
      rgba(0, 0, 0, 0.00345888) 63.94%,
      rgba(0, 0, 0, 0.014204) 65.89%,
      rgba(0, 0, 0, 0.0326639) 67.83%,
      rgba(0, 0, 0, 0.0589645) 69.78%,
      rgba(0, 0, 0, 0.0927099) 71.72%,
      rgba(0, 0, 0, 0.132754) 73.67%,
      rgba(0, 0, 0, 0.177076) 75.61%,
      rgba(0, 0, 0, 0.222924) 77.56%,
      rgba(0, 0, 0, 0.267246) 79.5%,
      rgba(0, 0, 0, 0.30729) 81.44%,
      rgba(0, 0, 0, 0.341035) 83.39%,
      rgba(0, 0, 0, 0.367336) 85.33%,
      rgba(0, 0, 0, 0.385796) 87.28%,
      rgba(0, 0, 0, 0.396541) 89.22%,
      rgba(0, 0, 0, 0.4) 91.17%
    );
    display: flex;
    align-items: flex-end;

    .title {
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      line-height: 22px;
    }
  }
}
</style>
