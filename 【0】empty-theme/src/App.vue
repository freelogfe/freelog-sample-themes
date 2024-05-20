<template>
  <template v-if="inMobile !== null">
    <div class="app-wrapper" :class="inMobile ? 'mobile' : 'pc'">
      <div class="tip">此主题供开发者使用，不支持常规展品的运营和展示。</div>
      <div class="tip">
        如需浏览更多主题，请前往
        <div class="btn" @click="openPage('https://console.freelog.com/market?query=主题')">资源市场</div>
        。
      </div>

      <div class="footer-wrapper">
        <div class="footer-btn" v-for="(item, index) in freelogEntrances" :key="item.label" @click="openPage(item.url)">
          <i class="freelog" :class="item.label" v-if="index === 0"></i>
          <span v-else>{{ item.label }}</span>
        </div>
      </div>
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";

/** freelog 相关入口 */
export interface freelogEntranceItem {
  label: string;
  url: string;
}

export default defineComponent({
  name: "App",

  setup() {
    const data = reactive({
      inMobile: null as boolean | null,
    });

    const assetsData = {
      /** freelog 相关入口 */
      freelogEntrances: [
        { label: "fl-icon-a-featherlogo5", url: "https://www.freelog.com/" },
        {
          label: "关于freelog",
          url: "https://freelog4.freelog.com/$freelog-61f252ef6fe5c1002e2c7b4b=/home_id=62d0d202456ff0002e3295ab",
        },
      ] as freelogEntranceItem[],
    };

    const methods = {
      /** 打开新标签页 */
      openPage(url: string) {
        window.open(url);
      },
    };

    /** 判断设备 */
    const judgeDevice = () => {
      const mobile =
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
      let inMobile = !!navigator.userAgent.match(mobile);
      if (!inMobile) {
        const deviceWidth = Math.min(document.body.clientWidth, document.body.clientHeight);
        if (deviceWidth <= 500) inMobile = true;
      }

      data.inMobile = inMobile;
    };

    judgeDevice();

    return {
      ...toRefs(data),
      ...assetsData,
      ...methods,
    };
  },
});
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Microsoft Yahei, Roboto, Oxygen, Ubuntu, Cantarell,
    "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  color: #222;
  background-color: #fff;
  text-align: left;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

body {
  margin: 0;
}

.app-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* PC */
.pc .tip {
  display: flex;
  color: #666;
  font-size: 26px;
  line-height: 1.5;
}

.pc .btn {
  color: rgba(39, 132, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s linear;
}

.pc .btn:hover {
  color: #2784ff;
}

.pc .btn:active {
  color: rgba(39, 132, 255, 0.6);
}

.pc .footer-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 50px;
  background-color: #fafbfc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc .footer-btn {
  font-size: 12px;
  padding: 0 20px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s linear;
}

.pc .footer-btn:hover {
  color: #2784ff;
}

.pc .footer-btn:active {
  color: rgba(39, 132, 255, 0.6);
}

.pc .footer-btn + .footer-btn {
  border-left: 1px solid rgba(0, 0, 0, 0.15);
}

/* mobile */
.mobile .tip {
  color: #999;
  font-size: 14px;
  line-height: 1.5;
  display: flex;
}

.mobile .btn {
  color: #2784ff;
}

.mobile .btn:active {
  color: rgba(39, 132, 255, 0.6);
}

.mobile .footer-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 100px;
  background-color: #fafbfc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile .footer-btn {
  font-size: 12px;
  padding: 0 20px;
  color: #999999;
}

.mobile .footer-btn:active {
  color: rgba(39, 132, 255, 0.8);
}

.mobile .footer-btn + .footer-btn {
  border-left: 1px solid rgba(0, 0, 0, 0.15);
}
</style>
