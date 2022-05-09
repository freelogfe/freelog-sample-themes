<template>
  <div>123</div>
  <div class="reveal-viewport" :class="bodyClass" v-html="content"></div>
</template>

<script>
import Reveal from "reveal.js";
import { reactive, toRefs } from "@vue/reactivity";
import { getExhibitFileStream } from "@/api/freelog";
import { nextTick } from "@vue/runtime-core";
import "reveal.js/dist/reveal.css";

export default {
  setup() {
    const data = reactive({
      bodyClass: "",
      content: "",
    });

    const init = async () => {
      const info = await getExhibitFileStream("625fc845ee7a5600399ab0ac");
      const bodyClasses = info.data.match(/<body class="(.*)"/);
      if (bodyClasses) {
        const bodyClass = info.data.match(/<body class="(.*)"/)[0];
        data.bodyClass = bodyClass.replace(/<body class="|""/g, "");
      }
      info.data = info.data.replace(/<div class="slide"/g, "<section");
      info.data = info.data.replace(/<\/div>/g, "<\/section>");
      info.data = info.data.replace(/<body>/, `<body><div class="reveal"><div class="slides">`);
      info.data = info.data.replace(/<\/body>/, `</div></div><\/body>`);
      data.content = info.data;

      nextTick(() => {
        Reveal.initialize();
      });
    };

    init();

    return {
      ...toRefs(data),
    };
  },
};
</script>

<style>
.home-wrapper {
  height: 100%;
  overflow: hidden;
  position: relative;
  line-height: 1;
  margin: 0;
  background-color: #fff;
  color: #000;
}
</style>
