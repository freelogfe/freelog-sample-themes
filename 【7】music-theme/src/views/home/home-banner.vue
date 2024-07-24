<script setup lang="ts"></script>

<template>
  <div class="home-banner-wrap">
    <!-- https://fastly.picsum.photos/id/617/1440/660.jpg?hmac=FUdnWol-2hYf4N9nyQ7G_KkHWeon3TjgnQPPhIfSGgA -->
    <div class="avatar">
      <img
        src="https://fastly.picsum.photos/id/886/170/170.jpg?hmac=pS3kuW8yXp5t8UX3v-vMkM3wA0fcbAeeSyo9NyUIQqs"
        alt="avatar"
      />
    </div>
    <div class="node-name">自定义节点名字</div>

    <div class="node-desc-box">
      <div class="node-desc">自定义节点介绍</div>
      <div class="node-desc">自定义节点介绍</div>
      <div class="node-desc">自定义节点介绍</div>
    </div>

    <div class="node-visit"></div>
  </div>
</template>

<style lang="less" scoped>
.home-banner-wrap {
  .avatar {
    width: 170px;
    height: 170px;
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .node-name {
    padding-top: 25px;
    height: 60px;
    font-weight: 600;
    font-size: 40px;
    color: #ffffff;
    line-height: 60px;
  }

  .node-desc-box {
    padding: 25px;
    .node-desc {
      margin-bottom: 15px;
    }
  }

  .node-visit {
  }
}
</style>
