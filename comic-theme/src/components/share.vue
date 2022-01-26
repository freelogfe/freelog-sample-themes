<template>
  <transition name="fade">
    <div class="share-wrapper" @click.stop v-if="show">
      <div class="share-popup">
        <div class="share-title">分享</div>

        <input id="href" class="hidden-input" :value="href" readOnly />

        <textarea class="textarea" v-model="shareText"></textarea>

        <div class="btns-box">
          <div class="share-btns">
            <div class="share-label">快速分享至：</div>
            <div
              class="share-btn-item"
              :style="{ backgroundColor: item.bgColor }"
              v-for="item in shareBtns"
              :key="item.id"
              @click="share(item)"
            >
              <i class="freelog" :class="item.icon"></i>
            </div>
          </div>

          <div class="copy-btn" @click="share({ id: 'copy', name: '' })">复制链接</div>

          <transition name="fade">
            <div class="qrcode-popup-wrapper" @click="qrcodeShow = false" v-if="qrcodeShow">
              <div class="qrcode-popup" @click.stop>
                <i class="close-btn freelog fl-icon-guanbi" @click="qrcodeShow = false"></i>
                <div class="qrcode-text">分享到{{ qrcodeInfo.name }}</div>
                <qrcode-vue :value="qrcodeInfo.url" :size="220" level="M" />
                <div class="qrcode-text">使用{{ qrcodeInfo.name }}扫一扫完成分享</div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { reactive, toRefs } from "@vue/reactivity";
import { ExhibitItem } from "@/api/interface";
import { shareBtns } from "@/api/data";
import { showToast } from "@/utils/common";
import { watch } from "vue";
import QrcodeVue from "qrcode.vue";

export default {
  name: "share",

  components: {
    QrcodeVue
  },

  props: ["show", "exhibit"],

  setup(props: { show: boolean; exhibit: ExhibitItem }) {
    const store = useStore();

    const data = reactive({
      shareText: "",
      href: "",
      qrcodeShow: false,
      qrcodeInfo: { name: "", url: "" },
    });

    const methods = {
      share(item: { id: string; name: string }) {
        const url = data.href;
        const title = props.exhibit?.exhibitTitle;
        const summary = ``;
        const image = props.exhibit?.coverImages[0];

        if (item.id === "qqZone") {
          // QQ空间
          const shareWeb = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&desc=${data.shareText}&summary=${summary}&title=${title}&pics=${image}`;
          window.open(shareWeb);
        } else if (item.id === "weibo") {
          // 微博
          const weiboTitle = `我在freelog发现一个不错的漫画：${props.exhibit?.exhibitTitle}`;
          window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${weiboTitle}&pic=${image}`);
        } else if (item.id === "douban") {
          // 豆瓣
          window.open(`https://www.douban.com/share/service?url=${url}&title=${title}&image=${image}`);
        } else if (["qq", "wechat"].includes(item.id)) {
          // qq、微信
          data.qrcodeInfo = { name: item.name, url };
          data.qrcodeShow = true;
        } else if (item.id === "copy") {
          // 复制链接
          const input: any = document.getElementById("href");
          input.select();
          document.execCommand("Copy");
          showToast("链接复制成功～");
        }
      },
    };

    const initShare = () => {
      const url = (window.location as any).currentURL;
      data.href = url;
      data.shareText = `我在freelog发现一个不错的漫画：${props.exhibit?.exhibitTitle} ${url}`;
      if (!props.show) data.qrcodeShow = false;
    };

    watch(
      () => props.exhibit,
      () => {
        initShare();
      }
    );
    
    initShare();

    return {
      shareBtns,
      ...toRefs(store.state),
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.share-wrapper {
  position: absolute;
  right: 0;
  top: 100%;
  padding-top: 10px;
  z-index: 1;
  cursor: default;

  .share-popup {
    width: 650px;
    padding: 17px 30px 20px;
    box-sizing: border-box;
    background-color: #ffffff;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.1);
    border-radius: 6px;

    .share-title {
      font-size: 14px;
      font-weight: 600;
      color: #222222;
      line-height: 20px;
    }

    .hidden-input {
      position: absolute;
      z-index: -1;
    }

    .textarea {
      width: 100%;
      height: 100px;
      border-radius: 4px;
      border: 1px solid #d8d8d8;
      padding: 10px;
      box-sizing: border-box;
      font-size: 14px;
      color: #222222;
      line-height: 20px;
      margin-top: 17px;
      outline: none;
      resize: none;
    }

    .btns-box {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;

      .share-btns {
        position: relative;
        display: flex;
        align-items: center;

        .share-label {
          font-size: 12px;
          color: #999999;
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

        .qq-iframe {
          position: absolute;
          height: 500px;
          left: 0px;
          bottom: 100%;
        }
      }

      .copy-btn {
        padding: 0 20px;
        height: 38px;
        border-radius: 4px;
        font-size: 14px;
        color: #fff;
        background-color: #2784ff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-weight: bold;

        &:hover {
          background-color: #529dff;
        }

        &:active {
          background-color: #2376e5;
        }
      }

      .qrcode-popup-wrapper {
        position: fixed;
        inset: 0;
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
  }
}
</style>
