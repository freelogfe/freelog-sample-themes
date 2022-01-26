<template>
  <!-- mobile -->
  <transition name="fade">
    <div class="modal" @click="closeDirectory()" v-if="inMobile && show"></div>
  </transition>
  <transition name="slide-right">
    <div class="mobile-directory-wrapper" v-if="inMobile && show">
      <div class="directory-header">
        <div class="directory-title">{{ comicInfo?.exhibitTitle }}</div>
        <i class="close-btn freelog fl-icon-guanbi" @click="closeDirectory()"></i>
      </div>

      <div class="directory-list">
        <div class="directory-item" v-for="(item, index) in directoryList" :key="item + index">
          <div class="item-content">
            <div class="item-title" :class="{ active: index === 0 }">
              {{ item }}
            </div>
            <i class="freelog fl-icon-zhankaigengduo"></i>
          </div>
        </div>

        <div class="no-more">— 已加载全部章节 —</div>
      </div>
    </div>
  </transition>

  <!-- PC -->
  <transition name="fade">
    <div class="directory-wrapper" @click="closeDirectory()" v-if="!inMobile && show">
      <div class="directory-popup" @click.stop>
        <div class="directory-header">
          <div class="directory-title">{{ comicInfo?.exhibitTitle }}</div>
          <i class="close-btn freelog fl-icon-guanbi" @click="closeDirectory()"></i>
        </div>

        <div class="directory-item" v-for="(item, index) in directoryList" :key="item + index">
          <div class="item-title">{{ item }}</div>
          <div class="item-status">已授权</div>
        </div>

        <div class="no-more">— 已加载全部章节 —</div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { toRefs } from 'vue';

export default {
  name: "directory",

  props: ["show", "comicInfo"],

  emits: ["closeDirectory"],

  setup(props: any, context: any) {
    const store = useStore();
    const directoryList = Array.from({ length: 12 }, () => props.comicInfo?.exhibitTitle || "章节名称");

    const methods = {
      closeDirectory() {
        context.emit("closeDirectory");
      },
    };

    return {
      ...toRefs(store.state),
      directoryList,
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
// mobile
.modal {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.mobile-directory-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  right: 50px;
  bottom: 0;
  background-color: #fff;
  border-radius: 0px 10px 10px 0px;
  display: flex;
  flex-direction: column;
  z-index: 100;

  .directory-header {
    width: 100%;
    height: 60px;
    padding: 0 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .directory-title {
      font-size: 16px;
      font-weight: 600;
      color: #222222;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .close-btn {
      width: 12px;
      height: 12px;
      font-size: 12px;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 50px;
    }
  }

  .directory-list {
    width: 100%;
    flex: 1;
    overflow-y: auto;

    .directory-item {
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      &:first-child .item-content {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.02);
      }

      .item-content {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);

        .item-title {
          flex: 1;
          font-size: 14px;
          line-height: 20px;
          color: #222222;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          &.active {
            color: #2784ff;
          }
        }

        .fl-icon-zhankaigengduo {
          width: 6px;
          height: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 70px;
        }
      }
    }

    .no-more {
      font-size: 14px;
      color: #999999;
      line-height: 20px;
      margin: 20px 0;
      text-align: center;
    }
  }
}

// PC
.directory-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 101;

  .directory-popup {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 50%;
    margin-right: -400px;
    width: 500px;
    background-color: #fff;
    padding: 0 30px;

    .directory-header {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);

      .directory-title {
        font-size: 16px;
        font-weight: 600;
        color: #222222;
      }

      .close-btn {
        width: 12px;
        height: 12px;
        font-size: 12px;
        color: #333;
        cursor: pointer;
      }
    }

    .directory-item {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);

      .item-title {
        font-size: 14px;
        line-height: 20px;
        color: #222222;
        cursor: pointer;
      }

      .item-status {
        font-size: 14px;
        color: #42c28c;
      }
    }

    .no-more {
      font-size: 14px;
      color: #999999;
      line-height: 20px;
      margin-top: 30px;
      text-align: center;
    }
  }
}
</style>
