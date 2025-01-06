<template>
  <div
    ref="contentBody"
    class="markdown-wrapper"
    v-html="content"
    v-highlight
    oncontextmenu="return false"
  ></div>
</template>

<script lang="ts">
import showdown from "showdown";
import { ref } from "@vue/reactivity";
import { nextTick, watch } from "@vue/runtime-core";
import { ExhibitItem } from "@/api/interface";
import { SetupContext } from "vue";
import { useStore } from "vuex";
import { ExhibitVersionInfo, freelogApp } from "freelog-runtime";

export default {
  name: "my-markdown",

  props: ["data"],

  emits: ["getDirectory"],

  setup(props: { data: ExhibitItem }, context: SetupContext) {
    const store = useStore();

    const content = ref("");
    const contentBody = ref<any>(null);
    let videoList: any[] = [];

    showdown.setOption("tables", true);
    showdown.setOption("tasklists", true);
    showdown.setOption("simplifiedAutoLink", true);
    showdown.setOption("openLinksInNewWindow", true);
    showdown.setOption("backslashEscapesHTMLTags", true);
    showdown.setOption("emoji", true);
    showdown.setOption("splitAdjacentBlockquotes", true);
    showdown.setOption("strikethrough", true);
    showdown.setOption("simpleLineBreaks", true);

    const getContent = async () => {
      let html = "";
      const { exhibitProperty, dependencyTree } = props.data.versionInfo as ExhibitVersionInfo;
      if (
        typeof exhibitProperty?.mime === "string" &&
        exhibitProperty?.mime.includes("text/markdown")
      ) {
        // markdown 文件，以 markdown 解析
        const converter = new showdown.Converter();
        html = converter.makeHtml(props.data.content || "");
      } else {
        html = props.data.content || "";
        html = html.replace(/\n/g, "<br/>");
      }

      const deps = dependencyTree.filter((_: any, index: number) => index !== 0);
      let promiseArr = [] as Promise<any>[];
      deps.forEach(dep => {
        const isMediaResource =
          dep.resourceType.includes("图片") ||
          dep.resourceType.includes("视频") ||
          dep.resourceType.includes("音频");
        const depContent = (freelogApp as any).getExhibitDepFileStream(props.data.exhibitId, {
          nid: dep.nid,
          returnUrl: isMediaResource
        });
        promiseArr.push(depContent);
      });

      const res = await Promise.all(promiseArr);
      res.forEach((dep, index) => {
        if (dep.data) {
          // 进一步判断是否为文本文件
          if (!dep.headers["content-type"].startsWith("text")) return;

          // 返回数据是对象，且有data属性，说明该依赖为非媒体资源
          const reg = new RegExp("{{" + `freelog://${deps[index].articleName}` + "}}", "g");
          const converter = new showdown.Converter();
          const data = converter.makeHtml(String(dep.data));
          html = html.replace(reg, data);
        } else {
          // 媒体资源
          const reg = new RegExp(
            "src=['\"]" + `freelog://${deps[index].articleName}` + "['\"]",
            "g"
          );
          html = html.replace(reg, `src="${dep}"`);
        }
      });

      // 隐藏视频与音频的下载按钮
      html = html.replace(/<img/g, "<p><img");
      html = html.replace(/<video/g, '<p><video controlslist="nodownload"');
      html = html.replace(/<audio/g, '<p><audio controlslist="nodownload"');

      content.value = html;

      nextTick(() => {
        const elements = [...contentBody.value.children];
        const titles = elements.filter((item: HTMLElement) =>
          ["H1", "H2", "H3"].includes(item.nodeName)
        );

        /** 所有图片加载完成再进行标题跳转，否则会因为图片未加载时高度问题造成滚动条移动到错误位置 */
        const imgs = [...document.getElementsByTagName("img")].filter(item => !item.className);

        if (imgs.length) {
          let num = imgs.length;
          imgs.forEach(img => {
            img.onload = () => {
              num--;
              if (num === 0) context.emit("getDirectory", titles);
            };
            img.onerror = () => {
              num--;
              if (num === 0) context.emit("getDirectory", titles);
            };
          });
        } else {
          context.emit("getDirectory", titles);
        }
      });
    };

    watch(
      () => props.data,
      cur => {
        if (!cur.content) return;
        getContent();
      },
      { immediate: true, deep: true }
    );

    return {
      content,
      contentBody
    };
  }
};
</script>

<style lang="scss" scoped>
::v-deep.markdown-wrapper {
  width: 100%;
  font-size: 16px;
  color: #222;
  word-break: break-all;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #222;
    line-height: 1.25;
    margin-top: 50px;
    margin-bottom: 20px;
    font-weight: bold;
  }

  h1 {
    font-size: 36px;
    margin-top: 0;
  }

  h2 {
    font-size: 32px;
  }

  h3 {
    font-size: 28px;
  }

  h4 {
    font-size: 22px;
  }

  h5 {
    font-size: 16px;
  }

  h6 {
    font-size: 13.6px;
    color: #6a737d;
  }

  hr {
    height: 4px;
    padding: 0;
    margin: 50px 0;
    background-color: #e1e4e8;
    border: 0;
  }

  p {
    white-space: pre-wrap;
    font-weight: normal;
    line-height: 1.6;
    margin-top: 0;
    margin-bottom: 16px;
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }

  blockquote {
    color: #6a737d;
    border-left: 3px solid #dfe2e5;
    background-color: #fafafa;
    padding: 4px 0 4px 16px;
    margin-bottom: 10px;

    p {
      margin: 4px 0;
    }
  }

  ol,
  ul {
    padding-left: 32px;
    padding-bottom: 16px;
    line-height: 1.7;
  }

  ol {
    list-style-type: decimal;
  }

  ul {
    list-style-type: disc;
  }

  pre {
    padding: 16px;
    overflow-x: auto;
    font-size: 14px;
    line-height: 1.45;
    background-color: #323232;
    border-radius: 3px;
    font-family: sans-serif;
    letter-spacing: 0.6px;

    & + pre {
      margin-top: 30px;
    }

    ::-webkit-scrollbar {
      height: 8px;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.2);
    }

    ::-webkit-scrollbar-thumb {
      height: 8px;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.3);

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }

    code {
      background-color: transparent;
      color: #fff;
      padding: 0;
    }
  }

  code {
    padding: 2px 8px;
    color: rgba(0, 0, 0, 0.8);
    background-color: #f7f7f9;
    border-radius: 3px;
  }

  a {
    color: #3eaf7c;
    font-weight: 500;
    text-decoration: none;
  }

  img,
  video,
  audio {
    max-width: 100%;
    margin-left: 50%;
    transform: translateX(-50%);
  }

  video {
    width: 100%;
  }

  table {
    display: block;
    word-break: initial;
    width: 100%;
    overflow: auto;
    margin-bottom: 30px;

    tbody tr:nth-child(2n) {
      background-color: #f6f8fa;
    }

    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;

      th,
      td {
        padding: 10px 13px;
        border: 1px solid #dfe2e5;
      }

      th {
        font-weight: bold;
      }
    }
  }
}
</style>
