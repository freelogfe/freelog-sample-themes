<!-- 标签组 -->

<template>
  <div class="tags-page-container" ref="tagsPageContainerRef">
    <div
      class="tags-wrapper"
      :style="`--movingUp:${distance}px;`"
      :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile, moving: isSwitch && isShow }"
      ref="tagsRef"
      @mouseenter="handleTagsHover"
      @mouseleave="handleTagsLeave"
    >
      <div
        class="tag"
        :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }"
        :style="computedStyle"
        v-for="item in tags"
        :key="item"
        @click="searchTag(item)"
      >
        <div class="content">{{ item }}</div>
      </div>
    </div>
    <div
      class="tags-tooltip"
      :class="{ 'show-left': tooltipLeft }"
      v-show="showTagTooltip"
      :style="tooltipStyle"
      @mouseenter="isMouseOverTooltip = true"
      @mouseleave="handleTooltipLeave"
    >
      <div class="tooltip-tag" v-for="item in tags" :key="item" @click="searchTag(item)">
        {{ item }}
      </div>
    </div>
    <div v-if="isSwitch && isShow" class="switch freelog fl-icon-qiehuan" @click="moveTag"></div>
  </div>
</template>

<script lang="ts">
import { useMyRouter } from "@/utils/hooks";
import { useStore } from "vuex";
import { ref, computed, onMounted, reactive, toRefs, nextTick, watch } from "vue";

export default {
  name: "tags",

  props: {
    tags: {
      type: Array,
      default: () => []
    },
    maxWidthObj: {
      type: Object,
      default: () => ({
        isVaild: false,
        maxWidth: 80
      })
    },
    isSwitch: {
      type: Boolean,
      default: false
    }
  },

  setup(props: any) {
    const store = useStore();
    const { switchPage } = useMyRouter();

    const tagsRef = ref();
    const aTagRef = ref();
    const tagsPageContainerRef = ref();
    const isShow = ref(false);
    const showTagTooltip = ref(false);
    const tooltipStyle = ref({});
    const isMouseOverTooltip = ref(false);
    const tooltipLeft = ref(false);

    const state = reactive({
      currentRow: 1, // 当前行
      maxRow: 1, // 总行数
      rowHight: 0
    });

    const inMobile = computed(() => {
      return store.state.inMobile;
    });

    const computedStyle = computed(() => {
      if (props.maxWidthObj.isVaild) {
        return `max-width:${props.maxWidthObj.maxWidth}px;`;
      }
      return "";
    });

    const distance = computed(() => {
      let gap = inMobile.value ? 8 : 5;
      return -(state.currentRow - 1) * (state.rowHight + gap);
    });

    const measureTagsLayout = () => {
      const el = tagsRef.value as HTMLElement | undefined;
      if (!el || el.children.length === 0) {
        isShow.value = false;
        state.currentRow = 1;
        state.maxRow = 1;
        state.rowHight = 0;
        return;
      }

      const tagsHeight = el.offsetHeight;
      const firstTag = el.children[0] as HTMLElement;
      const aTagHeight = firstTag.offsetHeight;
      const gap = inMobile.value ? 8 : 5;
      state.rowHight = aTagHeight;

      if (tagsHeight > aTagHeight) {
        isShow.value = true;
        state.maxRow = Math.floor((tagsHeight + gap) / (aTagHeight + gap));
      } else {
        isShow.value = false;
        state.maxRow = 1;
      }
    };

    onMounted(() => {
      nextTick(() => measureTagsLayout());
    });

    watch(
      () => props.tags,
      () => nextTick(() => measureTagsLayout()),
      { deep: true }
    );

    /** 处理标签容器悬停事件 */
    const handleTagsHover = (event: MouseEvent) => {
      if (inMobile.value) return;

      // 检查标签是否超出容器宽度
      const tagsContainer = tagsRef.value as HTMLElement | undefined;
      const pageContainer = tagsPageContainerRef.value as HTMLElement | undefined;
      if (!tagsContainer || !pageContainer) return;

      const tagsContainerWidth = pageContainer.offsetWidth;

      // 计算所有标签的总宽度
      let totalTagsWidth = 0;
      const gap = inMobile.value ? 8 : 5;

      for (let i = 0; i < tagsContainer.children.length; i++) {
        const child = tagsContainer.children[i] as HTMLElement;
        if (child.classList.contains("tag")) {
          totalTagsWidth += child.offsetWidth + gap;
        }
      }

      // 如果总宽度超过容器宽度，显示提示框
      if (totalTagsWidth > tagsContainerWidth) {
        // 先重置位置
        tooltipLeft.value = false;
        showTagTooltip.value = true;
        // 使用 nextTick 确保 DOM 已更新后再计算位置
        nextTick(() => {
          const tooltip = tagsPageContainerRef.value?.querySelector(".tags-tooltip");
          if (tooltip && tagsPageContainerRef.value) {
            const containerRect = tagsPageContainerRef.value.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            // 如果 tooltip 会超出视口右侧，则显示在左侧
            tooltipLeft.value = containerRect.right + tooltipRect.width + 10 > viewportWidth;
          }
        });
      }
    };

    /** 处理标签容器鼠标离开事件 */
    const handleTagsLeave = () => {
      // 延迟一小段时间，给鼠标移动到提示框的机会
      setTimeout(() => {
        if (!isMouseOverTooltip.value) {
          showTagTooltip.value = false;
        }
      }, 100);
    };

    /** 处理提示框鼠标离开事件 */
    const handleTooltipLeave = () => {
      isMouseOverTooltip.value = false;
      showTagTooltip.value = false;
    };

    const methods = {
      /** 搜索标签 */
      searchTag(tag: string) {
        const query: { tags: string } = { tags: tag };
        switchPage("/search", query);
        showTagTooltip.value = false;
      },
      moveTag() {
        if (state.currentRow + 1 > state.maxRow) {
          state.currentRow = 1;
          return;
        }
        state.currentRow++;
      }
    };

    return {
      inMobile,
      ...methods,
      computedStyle,
      isShow,
      tagsRef,
      aTagRef,
      tagsPageContainerRef,
      distance,
      ...toRefs(state),
      showTagTooltip,
      tooltipStyle,
      isMouseOverTooltip,
      tooltipLeft,
      handleTagsHover,
      handleTagsLeave,
      handleTooltipLeave
    };
  }
};
</script>

<style lang="scss" scoped>
.tags-page-container {
  display: flex;
  height: 24px;
  // overflow: hidden;
  position: relative;

  /* 创建一个区域连接标签容器和提示框 */
  &:hover .tags-tooltip {
    visibility: visible;
    opacity: 1;
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
    height: fit-content;

    &.moving {
      transform: translateY(var(--movingUp));
    }

    &.in-mobile {
      gap: 8px;
    }

    &.in-pc {
      gap: 5px;
    }

    .tag {
      box-sizing: border-box;
      font-size: 12px;
      color: #666;
      background-color: transparent;
      height: 22px;
      line-height: 22px;
      padding: 0 8px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      border: 1px solid;

      .content {
        width: 100%;
        white-space: noWrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      // mobile
      &.in-mobile {
        &:active {
          color: #222;
        }
      }

      // PC
      &.in-pc {
        cursor: pointer;
        transition: all 0.2s linear;

        &:hover {
          color: #222;
        }
      }
    }
  }

  .tags-tooltip {
    position: absolute;
    width: 300px;
    max-width: 300px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.6);
    color: #ffffff;
    font-size: 12px;
    line-height: 18px;
    border-radius: 6px;
    padding: 10px;
    z-index: 10;
    word-wrap: break-word;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    top: -5px;
    left: calc(100% + 10px);

    /* 添加过渡效果 */
    transition: visibility 0s, opacity 0.2s;

    /* 创建一个连接区域，确保鼠标可以从标签移动到提示框 */
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -20px; /* 创建一个连接区域 */
      width: 20px;
      height: 100%;
      background: transparent;
    }

    &.show-left {
      left: auto;
      right: calc(100% + 10px);

      &::before {
        left: auto;
        right: -20px; /* 调整连接区域位置 */
      }
    }

    .tooltip-tag {
      cursor: pointer;
      padding: 2px 8px;
      border-radius: 11px;
      border: 1px solid #ffffff;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .switch {
    margin-left: auto;
    flex-shrink: 0;
    font-size: 16px;
    cursor: pointer;
    align-self: center;
  }
}
</style>
