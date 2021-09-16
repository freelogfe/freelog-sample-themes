<template>
  <div class="about-btn-wrapper p-fixed lb-0 z-1">
    <div
      class="about-btn brs-50p text-center fc-white cur-pointer transition"
      :class="{ active: aboutShow }"
      @click="aboutShow = !aboutShow"
    >
      about
    </div>
  </div>

  <transition name="fade">
    <div class="about-bar-wrapper p-fixed lb-0 w-100p px-30 b-box flex-row align-center justify-end" v-show="aboutShow">
      <div class="cur-pointer" @click="openWeb('http://console.testfreelog.com')">关于freelog</div>
      <div
        class="ml-50 cur-pointer"
        @click="openWeb('http://console.testfreelog.com/resource/details/611372050938740039ad6df2')"
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
.about-btn-wrapper {
  border-radius: 0 25px 25px 0;
  background-color: #f7f7f7;

  .about-btn {
    width: 50px;
    height: 50px;
    background: linear-gradient(145deg, #eaeaea, #c5c5c5);

    &:hover {
      box-shadow: 5px 5px 10px #bababa, -5px -5px 10px #fcfcfc;
    }

    &.active {
      box-shadow: 10px 10px 20px #bababa, -10px -10px 20px #fcfcfc;
    }
  }
}

.about-bar-wrapper {
  background: linear-gradient(to right, rgba(219, 219, 219, 0.9), rgba(240, 240, 240, 0.9));
  color: #aaaaaa;
  height: 50px;

  div:hover {
    color: #8b8b8b;
  }
}

@media (max-width: 400px) {
  .about-btn-wrapper {
    .about-btn {
      width: 40px;
      height: 40px;
    }
  }

  .about-bar-wrapper {
    height: 40px;
  }
}
</style>
