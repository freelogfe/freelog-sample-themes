<template>
  <teleport to="#modal">
    <transition name="fade">
      <div
        class="intro-modal-wrapper p-fixed full lt-0 z-200 text-center"
        v-show="show"
        @click="$emit('update:show', false)"
        @touchmove.prevent
        @scroll.stop.prevent
      >
        <div class="p-relative w-80p mw-500 mh-80p flex-column bg-white brs-12 py-40 px-32 b-box" @click.stop>
          <img
            class="p-absolute w-20 h-20 rt-20 cur-pointer"
            src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/dialog_close.a5f40ec8.png"
            alt="close"
            @click="$emit('update:show', false)"
          />
          <div class="fs-18 mb-16 lh-27">漫画名称</div>
          <div class="intro lh-24">
            {{ data.presentableTitle }}
          </div>

          <div class="fs-18 mt-32 mb-16 lh-27">简介</div>
          <div class="intro lh-24 flex-1 h-0 y-auto" v-html="data.intro"></div>

          <div class="fs-18 mt-32 mb-16 lh-27">其他信息</div>
          <div class="flex-row align-center space-between mt-self-12" v-for="item in otherInfo" :key="item.title">
            <div class="form-title">{{ item.title }}</div>
            <div class="form-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { ref, watchEffect } from "@vue/runtime-core";
import { formatDate } from "../utils/common";

export default {
  name: "intro-modal",

  props: ["data", "show"],

  setup(props: any) {
    const otherInfo = ref<{ title: string; value: any }[]>([]);

    watchEffect(() => {
      otherInfo.value = [
        {
          title: "作者",
          value: props.data.username,
        },
        {
          title: "创建时间",
          value: formatDate(props.data.createDate),
        },
        {
          title: "更新时间",
          value: formatDate(props.data.updateDate),
        },
        {
          title: "分类",
          value: props.data.tags?.join("、") || "无",
        },
      ];
    });

    return { otherInfo };
  },
};
</script>

<style lang="scss" scoped>
.intro-modal-wrapper {
  background-color: rgba(0, 0, 0, 0.4);

  .intro,
  .form-value {
    color: #5d646e;
  }

  .intro {
    &::-webkit-scrollbar {
      width: 2px !important;
    }

    /*定义滑块颜色、内阴影及圆角*/
    &::-webkit-scrollbar-thumb {
      background-color: #eee !important;
    }
  }

  .form-title {
    color: #858c96;
  }
}
</style>
