<template>
  <div class="loader" v-if="loading">
    <my-loader />
  </div>

  <div class="markdown-wrapper" v-html="content" v-if="!loading"></div>
</template>

<script lang="ts">
import showdown from "showdown";
import { ref } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { ExhibitItem } from "@/api/interface";
import { getExhibitDepFileStream } from "@/api/freelog";
import { defineAsyncComponent } from "vue";

export default {
  name: "my-markdown",

  components: {
    "my-loader": defineAsyncComponent(() => import("../components/loader.vue")),
  },

  props: ["data"],

  setup(props: { data: { content: string; exhibitInfo: ExhibitItem } }) {
    const loading = ref(true);
    const content = ref("");
    showdown.setOption("tables", true);
    showdown.setOption("tasklists", true);
    showdown.setOption("simplifiedAutoLink", true);
    showdown.setOption("openLinksInNewWindow", true);
    showdown.setOption("backslashEscapesHTMLTags", true);
    showdown.setOption("emoji", true);

    watch(
      () => props.data,
      () => {
        getContent();
      }
    );

    const getContent = async () => {
      loading.value = true;
      let html = "";
      const { exhibitProperty, dependencyTree } = props.data.exhibitInfo.versionInfo;
      if (exhibitProperty.mime === "text/markdown") {
        // markdown 文件，以 markdown 解析
        const converter = new showdown.Converter();
        html = converter.makeHtml(props.data.content);
      } else {
        html = props.data.content;
        html = html.replace(/\n/g, "<br/>");
      }

      const deps = dependencyTree.filter((_: any, index: number) => index !== 0);
      let promiseArr = [] as Promise<any>[];
      deps.forEach((dep: { resourceType: string; parentNid: any; articleId: any }) => {
        const isMediaResource = ["image", "video", "audio"].includes(dep.resourceType);
        const depContent: Promise<any> = getExhibitDepFileStream(
          props.data.exhibitInfo.exhibitId,
          dep.parentNid,
          dep.articleId,
          isMediaResource
        );
        promiseArr.push(depContent);
      });

      await Promise.all(promiseArr).then((res) => {
        res.forEach((dep, index) => {
          if (dep.data) {
            // 返回数据是对象，切有data属性，说明该依赖未非媒体资源
            const reg = new RegExp("{{" + `freelog://${deps[index].articleName}` + "}}", "g");
            const converter = new showdown.Converter();
            const data = converter.makeHtml(dep.data);
            html = html.replace(reg, data);
          } else {
            // 媒体资源
            const reg = new RegExp("src=['\"]" + `freelog://${deps[index].articleName}` + "['\"]", "g");
            html = html.replace(reg, `src="${dep}"`);
          }
        });
      });

      content.value = html;
      loading.value = false;
    };

    return { loading, content };
  },
};
</script>

<style lang="scss" scoped>
::v-deep.markdown-wrapper {
  width: 100%;
  overflow-x: hidden;
  font-size: 16px;
  color: #222;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #222;
    line-height: 1.25;
    margin-top: 24px;
    margin-bottom: 16px;
  }

  h1 {
    font-size: 32px;
    margin-top: 0;
  }

  h2 {
    font-size: 24px;
  }

  h3 {
    font-size: 20px;
  }

  h4 {
    font-size: 16px;
  }

  h5 {
    font-size: 14px;
  }

  h6 {
    font-size: 13.6px;
    color: #6a737d;
  }

  hr {
    height: 4px;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }

  p {
    font-weight: normal;
    word-break: break-word;
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
    padding: 4px 0 4px 16px;

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
    font-size: 85%;
    line-height: 1.45;
    background-color: #282c34;
    border-radius: 3px;

    code {
      background-color: transparent;
      color: #fff;
    }
  }

  code {
    padding: 2px 4px;
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

    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;

      td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
      }
    }
  }
}
</style>
