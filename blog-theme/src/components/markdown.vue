<template>
  <div class="markdown-wrapper" v-html="content"></div>
</template>

<script lang="ts">
import showdown from "showdown";
import { ref } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";

export default {
  name: "my-markdown",

  props: ["data"],

  setup(props: { data: string }) {
    const content = ref("");

    watch(
      () => props.data,
      () => {
        const converter = new showdown.Converter();
        let html = converter.makeHtml(props.data);
        // 使所有的超链接都打开新窗口
        html = html.replace(/<a /g, "<a target='_blank' ");
        content.value = html;
      }
    );

    return {
      content,
    };
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
  video {
    max-width: 100%;
    margin-left: 50%;
    transform: translateX(-50%);
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
