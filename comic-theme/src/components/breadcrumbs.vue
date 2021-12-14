<template>
  <div
    class="breadcrumbs-wrapper"
    :class="{ 'in-reader': inReader, normal: !inReader, 'in-dark': dark, 'in-mobile': inMobile }"
  >
    <div class="breadcrumbs-item" v-for="(item, index) in breadcrumbsList" :key="item.name">
      <div
        class="second-text-btn"
        :class="{ current: index === breadcrumbsList.length - 1 }"
        @click="switchPage(item.path, item.query)"
      >
        {{ item.name }}
      </div>
      <div class="arrow" v-if="index !== breadcrumbsList.length - 1">></div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from "@vue/reactivity";
import { useStore } from "vuex";
import { useMyRouter } from "@/utils/hooks";
import { routerMappings } from "@/api/data";

interface breadcrumbsItem {
  path: string;
  name: string;
}

export default {
  name: "breadcrumbs",

  props: ['inReader', "title", "dark"],

  setup() {
    const store = useStore();
    const { switchPage } = useMyRouter();

    const data = reactive({
      breadcrumbsList: [] as breadcrumbsItem[],
    });

    const initBreadCrumbs = () => {
      let list: breadcrumbsItem[] = [];
      store.state.locationHistory.forEach((item: { path: string }) => {
        const name = routerMappings[item.path];
        const breadcrumbsItem = { ...item, name };
        list.push(breadcrumbsItem);
      });
      data.breadcrumbsList = list;
    };
    initBreadCrumbs();

    return {
      ...store.state,
      switchPage,
      ...toRefs(data),
    };
  },
};
</script>

<style lang="scss" scoped>
.breadcrumbs-wrapper {
  display: flex;
  align-items: flex-end;
  width: 100%;

  .breadcrumbs-item {
    display: flex;
    align-items: center;

    & + .breadcrumbs-item {
      margin-left: 10px;
    }

    .second-text-btn.current {
      pointer-events: none;
    }

    .arrow {
      margin-left: 8px;
    }
  }

  &.normal {
    margin: 55px 0;

    .breadcrumbs-item {
      font-size: 20px;
      color: #999999;
      line-height: 26px;

      .current {
        font-size: 30px;
        color: #222222;
        line-height: 36px;
        pointer-events: none;
      }
    }
  }

  &.in-reader {
    margin: 24px 0;

    .breadcrumbs-item {
      font-size: 16px;
      color: #999999;
      line-height: 22px;

      .current {
        font-size: 16px;
        line-height: 22px;
        color: #222222;
        font-weight: bold;
      }
    }
  }

  &.in-dark .breadcrumbs-item {
    color: #444444;

    .second-text-btn.current {
      color: #999999;
    }
  }

  &.in-mobile {
    display: none;
  }
}
</style>
