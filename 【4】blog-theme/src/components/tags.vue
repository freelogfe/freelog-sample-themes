<!-- 标签组 -->

<template>
  <div class="tags-page-container" ref="tagsPageContainerRef">
    <div class="tags-wrapper" :style="`--movingUp:${distance}px;`"
      :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile, 'moving': isSwitch && isShow }" ref="tagsRef" 
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
import { ref, computed, onMounted, reactive, toRefs } from "vue";

export default {
  name: "tags",

  props: {
    tags: {
      type: Array,
      default: () => [],
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

    const tagsRef = ref()
    const aTagRef = ref()
    const tagsPageContainerRef = ref()
    const isShow = ref(false)
    const showTagTooltip = ref(false)
    const tooltipStyle = ref({})
    const isMouseOverTooltip = ref(false)

    const state = reactive({
      currentRow: 1, // 当前行
      maxRow: 1, // 总行数
      rowHight: 0
    })

    const inMobile = computed(() => {
      return store.state.inMobile
    })

    const computedStyle = computed(() => {
      if (props.maxWidthObj.isVaild) {
        return `max-width:${props.maxWidthObj.maxWidth}px;`
      }
      return ''
    })

    const distance = computed(() => {
      let gap = inMobile.value ? 8 : 5;
      return -(state.currentRow - 1) * (state.rowHight + gap)
    })

    onMounted(() => {
      const tagsHeight = tagsRef.value.offsetHeight
      const aTagHeight = tagsRef.value.children[0].offsetHeight
      const gap = inMobile.value ? 8 : 5
      state.rowHight = aTagHeight
      
      if (tagsHeight > aTagHeight) {
        isShow.value = true
        state.maxRow = Math.floor((tagsHeight + gap) / (aTagHeight + gap))
      }
    })

    /** 处理标签容器悬停事件 */
    const handleTagsHover = (event: MouseEvent) => {
      if (inMobile.value) return;
      
      // 检查标签是否超出容器宽度
      const tagsContainer = tagsRef.value;
      const tagsContainerWidth = tagsPageContainerRef.value.offsetWidth;
      
      // 计算所有标签的总宽度
      let totalTagsWidth = 0;
      const gap = inMobile.value ? 8 : 5;
      
      for (let i = 0; i < tagsContainer.children.length; i++) {
        if (tagsContainer.children[i].classList.contains('tag')) {
          totalTagsWidth += tagsContainer.children[i].offsetWidth + gap;
        }
      }
      
      // 如果总宽度超过容器宽度，显示提示框
      if (totalTagsWidth > tagsContainerWidth) {
        showTagTooltip.value = true;
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
          state.currentRow = 1
          return
        }
        state.currentRow++
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
      handleTagsHover,
      handleTagsLeave,
      handleTooltipLeave
    };
  },
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
    color: #FFFFFF;
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
    left:calc(100% + 10px);
    
    /* 添加过渡效果 */
    transition: visibility 0s, opacity 0.2s;
    
    /* 创建一个连接区域，确保鼠标可以从标签移动到提示框 */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -20px; /* 创建一个连接区域 */
      width: 20px;
      height: 100%;
      background: transparent;
    }
    
    .tooltip-tag {
      cursor: pointer;
      padding: 2px 8px;
      border-radius: 11px;
      border: 1px solid #FFFFFF;
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
