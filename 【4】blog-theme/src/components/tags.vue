<!-- 标签组 -->

<template>
  <div class="tags-page-container">
    <div class="tags-wrapper" :style="`--movingUp:${distance}px;`"
      :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile, 'moving': isSwitch && isShow }" ref="tagsRef">
      <div
        class="tag"
        :class="{ 'in-mobile': inMobile, 'in-pc': !inMobile }"
        :style="computedStyle"
        v-for="item in tags"
        :key="item"
        :title="`搜索“${item}”`"
        @click="searchTag(item)"
      >
        <div class="content">{{ item }}</div>
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
    const isShow = ref(false)

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

    const methods = {
      /** 搜索标签 */
      searchTag(tag: string) {
        const query: { tags: string } = { tags: tag };
        switchPage("/search", query);
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
      distance,
      ...toRefs(state)
    };
  },
};
</script>

<style lang="scss" scoped>

.tags-page-container {
  display: flex;
  height: 24px;
  overflow: hidden;

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
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
      color: #575e6a;
      background-color: #ebecf0;
      height: 24px;
      padding: 0 8px;
      border-radius: 24px;
      display: flex;
      align-items: center;
  
      .content {
        width: 100%;
        white-space: noWrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
  
      // mobile
      &.in-mobile {
  
        &:active {
          background-color: #a0a5ae;
          color: #fff;
        }
      }
  
      // PC
      &.in-pc {
        cursor: pointer;
        transition: all 0.2s linear;
        
        &:hover {
          background-color: #a0a5ae;
          color: #fff;
        }
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
