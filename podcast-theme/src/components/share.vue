<!-- 分享 -->
<template>
  <div class="share-wrapper">
    <transition-group name="fade">
      <div class="share-modal" key="modal" @click="closeShare()" v-if="shareInfo.show" />

      <div class="share-popup" key="popup" v-if="shareInfo.show">
        <div class="title-area">
          <div class="title">分享</div>
          <i class="text-btn freelog fl-icon-guanbi" @click="closeShare()"></i>
        </div>

        <input id="href" class="hidden-input" :value="href" readOnly />

        <textarea class="textarea" v-model="shareText"></textarea>

        <div class="btns-box">
          <div class="share-btns">
            <div class="share-label">快速分享至：</div>
            <div
              class="share-btn-item"
              :style="{ 'background-color': item.bgColor }"
              v-for="item in shareBtns"
              :key="item.id"
              @click="share(item)"
            >
              <i class="freelog" :class="item.icon"></i>
            </div>
          </div>

          <div class="copy-btn" @click="share({ id: 'copy' })">
            <span class="copy-text" v-if="!copySuccess">复制链接</span>
            <template v-if="copySuccess">
              <i class="freelog fl-icon-a-chenggongzhengqueduigou1" :class="animation"></i>
              <span class="success-tip" :class="animation">复制成功</span>
            </template>
          </div>
        </div>
      </div>

      <div class="qrcode-popup-wrapper" key="qrcode" @click="qrcodeShow = false" v-if="qrcodeShow">
        <div class="qrcode-popup" @click.stop>
          <i class="close-btn freelog fl-icon-guanbi" @click="qrcodeShow = false"></i>
          <div class="qrcode-text">分享到{{ qrcodeInfo.name }}</div>
          <qrcode-vue :value="qrcodeInfo.url" :size="220" level="M" />
          <div class="qrcode-text">使用{{ qrcodeInfo.name }}扫一扫完成分享</div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { shareBtns } from "@/api/data";
import QrcodeVue from "qrcode.vue";

export default {
  name: "share",

  components: {
    QrcodeVue,
  },

  data() {
    return {
      shareBtns,
      show: false,
      shareText: "",
      href: "",
      qrcodeShow: false,
      qrcodeInfo: { name: "", url: "" },
      copySuccess: false,
      animation: "enter",
    };
  },

  watch: {
    "shareInfo.show"(cur) {
      this.$nextTick(() => {
        this.show = cur;
      });
      if (!cur) return;

      this.initShare();
    },
  },

  computed: {
    /** 分享信息 */
    shareInfo() {
      return this.$store.state.shareInfo;
    },
  },

  methods: {
    /** 初始化分享组件 */
    initShare() {
      const url = window.location.currentURL;
      this.href = url;
      this.shareText = `我在freelog发现一个不错的声音：${this.shareInfo.exhibit.exhibitTitle} ${url}`;
      if (!this.shareInfo.show) this.qrcodeShow = false;
    },

    /** 关闭分享弹窗 */
    closeShare() {
      this.$store.commit("setData", { key: "shareInfo", value: { show: false, exhibit: {} } });
    },

    /** 分享 */
    share(item) {
      const url = this.href;
      const title = this.shareInfo.exhibit.exhibitTitle;
      const summary = ``;
      const image = this.shareInfo.exhibit.coverImages[0];

      if (item.id === "qqZone") {
        // QQ空间
        const shareWeb = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&desc=${this.shareText}&summary=${summary}&title=${title}&pics=${image}`;
        window.open(shareWeb);
      } else if (item.id === "weibo") {
        // 微博
        const weiboTitle = `我在freelog发现一个不错的声音：${this.shareInfo.exhibit.exhibitTitle}`;
        window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${weiboTitle}&pic=${image}`);
      } else if (item.id === "douban") {
        // 豆瓣
        window.open(`https://www.douban.com/share/service?url=${url}&title=${title}&image=${image}`);
      } else if (["qq", "wechat"].includes(item.id)) {
        // qq、微信
        this.qrcodeInfo = { name: item.name, url };
        this.qrcodeShow = true;
      } else if (item.id === "copy") {
        // 复制链接
        if (this.copySuccess) return;

        const input = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        this.animation = "enter";
        this.copySuccess = true;
        setTimeout(() => {
          this.animation = "exit";
        }, 2000);
        setTimeout(() => {
          this.copySuccess = false;
        }, 2300);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.share-wrapper {
  z-index: 200;

  .share-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .share-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 650px;
    padding: 17px 30px 20px;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    backdrop-filter: blur(25px);

    .title-area {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.4);
        line-height: 20px;
      }

      .freelog {
        font-size: 10px;
        transform: scale(0.84);
        color: rgba(153, 153, 153, 0.4);
      }
    }

    .hidden-input {
      position: absolute;
      left: -100vw;
      z-index: -1;
    }

    .textarea {
      width: 100%;
      height: 100px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      padding: 10px;
      border: none;
      box-sizing: border-box;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 20px;
      margin-top: 17px;
      outline: none;
      resize: none;
    }

    .btns-box {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;

      .share-btns {
        position: relative;
        display: flex;
        align-items: center;

        .share-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          margin-right: 10px;
        }

        .share-btn-item {
          width: 38px;
          height: 38px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          .freelog {
            font-size: 20px;
            color: #fff;
          }

          & + .share-btn-item {
            margin-left: 15px;
          }
        }
      }

      .copy-btn {
        position: relative;
        width: 96px;
        height: 38px;
        border-radius: 4px;
        font-size: 14px;
        color: #fff;
        background-color: #2784ff;
        display: flex;
        align-items: center;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s linear;

        &:hover {
          background-color: rgba(39, 132, 255, 0.8);
        }

        &:active {
          background-color: rgba(39, 132, 255, 0.6);
        }

        .copy-text {
          position: absolute;
          width: fit-content;
          left: 50%;
          transform: translateX(-50%);
        }

        .freelog {
          position: absolute;
          font-size: 16px;

          &.enter {
            animation: scale 0.6s linear both;
          }

          &.exit {
            animation: icon-exit 0.6s linear both;
          }
        }

        .success-tip {
          position: absolute;
          word-break: keep-all;

          &.enter {
            animation: slide-left-fade 0.6s linear both;
          }

          &.exit {
            animation: tip-exit 0.6s linear both;
          }
        }
      }
    }
  }

  .qrcode-popup-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);

    .qrcode-popup {
      position: relative;
      padding: 0 30px;
      background-color: #ffffff;
      border-radius: 6px;
      border: 1px solid #dddddd;
      display: flex;
      flex-direction: column;
      align-items: center;

      .qrcode-text {
        font-size: 16px;
        color: #222222;
        line-height: 22px;
        margin: 20px 0;
      }

      .close-btn {
        position: absolute;
        top: 22px;
        right: 30px;
        width: 12px;
        height: 22px;
        font-size: 12px;
        color: #333;
        cursor: pointer;
      }
    }
  }
}

@keyframes scale {
  0% {
    left: 40px;
    transform: scale(0);
  }
  33% {
    left: 40px;
    transform: scale(1);
  }
  66% {
    left: 40px;
    transform: scale(1);
  }
  100% {
    left: 9px;
    transform: scale(1);
  }
}

@keyframes slide-left-fade {
  0% {
    opacity: 0;
    left: 61px;
  }
  33% {
    opacity: 0;
    left: 61px;
  }
  66% {
    opacity: 0;
    left: 61px;
  }
  100% {
    opacity: 1;
    left: 30px;
  }
}

@keyframes icon-exit {
  from {
    opacity: 1;
    left: 9px;
  }
  to {
    opacity: 0;
    left: 39px;
  }
}

@keyframes tip-exit {
  from {
    opacity: 1;
    left: 30px;
  }
  to {
    opacity: 0;
    left: 60px;
  }
}
</style>
