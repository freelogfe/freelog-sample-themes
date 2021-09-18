<template>
  <div
    class="about-btn p-fixed b-0 brs-50p text-center fc-white cur-pointer z-1"
    :class="{ active: aboutShow }"
    @click="aboutShow = !aboutShow"
  >
    about
  </div>

  <transition name="fade">
    <div
      class="about-bar-wrapper p-fixed lb-0 w-100p pr-80 b-box flex-row align-center justify-end"
      @click="aboutShow = false"
      v-show="aboutShow"
    >
      <div class="cur-pointer" @click.stop="openWeb('http://console.testfreelog.com')">关于freelog</div>
      <div
        class="ml-50 cur-pointer"
        @click.stop="openWeb('http://console.testfreelog.com/resource/details/61400afcf27e48003f5e230c')"
      >
        关于此主题
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
  name: "about-bar",

  setup() {
    const aboutShow = ref(false);
    const openWeb = (url: string) => {
      window.open(url);
    };

    return { aboutShow, openWeb };
  },
};
</script>

<style lang="scss" scoped>
.about-btn {
  width: 50px;
  height: 50px;
  background: linear-gradient(145deg, #eaeaea, #c5c5c5);
  left: 0;
  transition: all 2s ease;

  &.active,
  &:hover {
    box-shadow: 5px 5px 10px #bababa, -5px -5px 10px #fcfcfc;
  }

  &.active {
    left: calc(100% - 50px);
    transform: rotate(1080deg);
    transition: all 1s ease;
  }
}

.about-bar-wrapper {
  background: linear-gradient(to right, rgba(219, 219, 219, 0.9), rgba(240, 240, 240, 0.9));
  color: #aaaaaa;
  height: 50px;
  border-radius: 0 50px 50px 0;

  div:hover {
    color: #8b8b8b;
  }
}

@media (max-width: 400px) {
  .about-btn {
    width: 40px;
    height: 40px;

    &.active {
      left: calc(100% - 40px);
    }
  }

  .about-bar-wrapper {
    height: 40px;
    border-radius: 0 40px 40px 0;
  }
}
</style>
