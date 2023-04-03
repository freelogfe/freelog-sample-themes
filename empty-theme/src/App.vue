<template>
  <div class="test-wrapper">
    <input class="upload-btn" type="file" id="file" @change="getFile" />
    <img style="width: 500px; height: 500px" :src="testImg" alt="" />
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from "vue";
import JSZip from "jszip";

export default {
  name: "test",

  setup() {
    const data = reactive({
      widgetController: null as any,
      testImg: "",
    });

    const methods = {
      async getFile(e: any) {
        let JSZIP = new JSZip();
        const zipData = await JSZIP.loadAsync(e.target.files[0]);
        console.log("start from JSZIP");
        Object.keys(zipData.files).forEach((filename) => {
          JSZIP.files[filename]
            .async("base64")
            .then((result: any) => {
              console.log("done from JSZIP");
              data.testImg = "data:image/jpg;base64," + result;
            })
            .catch((error: any) => console.error("error====>", error));
        });
      },

      async open() {
        // const commonData = await (window as any).freelogApp.getSubDep();
        // console.error(commonData)
        // const widget = datasOfGetList.listData.value[1];
        const widget = null;
        data.widgetController = await (window as any).freelogApp.mountWidget({
          widget,
          container: document.getElementById("widget-wrapper"), // 给每一个提供不同的容器
          // commonData,
          widget_entry: "http://localhost:8200/",
        });
        const result = await data.widgetController.mount();
        console.error(result);
      },

      async close() {
        const res = await data.widgetController.unmount();
        console.error(res);
      },

      getApi() {
        const res = data.widgetController.getApi();
        console.error(res);
        res.show();
      },
    };

    return {
      ...toRefs(data),
      ...methods,
    };
  },
};
</script>

<style>
#widget-wrapper {
  width: 500px;
  height: 500px;
}

.test-wrapper {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  margin-bottom: 50px;
}
</style>
