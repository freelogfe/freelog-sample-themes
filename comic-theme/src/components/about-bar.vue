<template>
  <div
    class="about-btn p-fixed l-0 b-5 brs-50p text-center fc-white cur-pointer z-1"
    :class="{ active: aboutShow }"
    @click="aboutShow = !aboutShow"
  >
    about
  </div>

  <transition name="fade">
    <div
      class="about-bar-wrapper p-fixed lb-0 w-100p pr-26 b-box flex-row align-center justify-end"
      @click="aboutShow = false"
      v-show="aboutShow"
    >
      <div class="cur-pointer" @click.stop="openWeb('http://console.testfreelog.com')">关于freelog</div>
      <div
        class="ml-50 cur-pointer"
        @click.stop="openWeb('http://console.testfreelog.com/resource/details/611372050938740039ad6df2')"
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
  transition: all 0.3s ease;

  &.active,
  &:hover {
    box-shadow: 5px 5px 10px #bababa, -5px -5px 10px #fcfcfc;
  }

  &.active {
    bottom: 25px !important;
  }
}

.about-bar-wrapper {
  background: linear-gradient(to right, rgba(219, 219, 219, 1), rgba(240, 240, 240, 1));
  color: #aaaaaa;
  height: 50px;

  div:hover {
    color: #8b8b8b;
  }
}

@media (max-width: 400px) {
  .about-btn {
    width: 40px;
    height: 40px;
    font-size: 12px;

    &.active {
      bottom: 20px !important;
    }
  }

  .about-bar-wrapper {
    height: 40px;
  }
}
</style>
