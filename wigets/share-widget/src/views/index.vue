<template>
  <transition name="fade-in-out">
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

          <transition name="fade-in-out">
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
import { reactive, toRefs } from "@vue/reactivity";
import { ExhibitItem } from "@/api/interface";
import { shareBtns } from "@/api/data";
import { showToast } from "@/utils/common";
import QrcodeVue from "qrcode.vue";
import { useStore } from "@/store";
import { storeToRefs } from "pinia";
import { getCurrentUrl, getSelfConfig, pushMessage4Task } from "@/api/freelog";

export default {
  name: "share",

  components: {
    QrcodeVue,
  },

  setup() {
    const store = useStore();

    const data = reactive({
      exhibit: {} as ExhibitItem,
      shareText: "",
      href: "",
      qrcodeShow: false,
      qrcodeInfo: { name: "", url: "" },
    });

    const methods = {
      /** 分享 */
      share(item: { id: string; name: string }) {
        const url = data.href;
        const title = data.exhibit?.exhibitTitle;
        const summary = ``;
        const image = data.exhibit?.coverImages[0];

        if (item.id === "qqZone") {
          // QQ空间
          const shareWeb = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&desc=${data.shareText}&summary=${summary}&title=${title}&pics=${image}`;
          window.open(shareWeb);
        } else if (item.id === "weibo") {
          // 微博
          window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${data.shareText}&pic=${image}`);
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
        pushMessage4Task({ taskConfigCode: "TS000077", meta: { presentableId: data.exhibit.exhibitId } });
      },
    };

    /** 初始化数据 */
    const initData = async () => {
      const widgetConfig = await getSelfConfig();
      const url = getCurrentUrl();
      const type = widgetConfig.type || "展品";
      data.exhibit = widgetConfig.exhibit;
      data.href = url;
      data.shareText = `我在freelog发现一个不错的${type}：\n《${data.exhibit?.exhibitTitle}》\n${url}`;
    };

    initData();

    return {
      shareBtns,
      ...storeToRefs(store),
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style lang="scss" scoped>
.share-wrapper {
  padding-top: 10px;
  box-sizing: border-box;
  z-index: 1;
  background-color: transparent;
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
      height: 125px;
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
      word-break: break-all;

      &::-webkit-scrollbar {
        width: 5px;
      }

      &::-webkit-scrollbar-thumb {
        width: 5px;
        border-radius: 5px;
        background: rgba(0, 0, 0, 0.15);

        &:hover {
          background: rgba(0, 0, 0, 0.35);
        }
      }

      &::-webkit-scrollbar-track {
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 5px;
      }
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

/* fade-in-out */
.fade-in-out-enter-active,
.fade-in-out-leave-active {
  transition: all 0.2s ease;
}
.fade-in-out-enter-from,
.fade-in-out-leave-to {
  opacity: 0;
}
</style>
