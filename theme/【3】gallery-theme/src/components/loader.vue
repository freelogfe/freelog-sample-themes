<!-- loading 动画 -->

<template>
  <div class="loader-wrapper">
    <div class="camera">
      <span class="lens"></span>
      <span class="picture"></span>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: "LoderComp",
}
</script>
<style lang="scss" scoped>
.loader-wrapper {
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;

  .camera {
    width: 120px;
    height: 138px;
    font-size: 60px;
    background: radial-gradient(circle at 68px 42px, black 4.8px, darkgray 4.8px, darkgray 6px, transparent 6px),
      linear-gradient(transparent 108px, #333 108px, #333 117px, transparent 117px) no-repeat center / 80% 100%,
      linear-gradient(
        rgb(208, 230, 255) 60px,
        rgb(188, 219, 255) 60px,
        rgb(181, 204, 255) 84px,
        rgb(150, 204, 255) 84px
      );
    border-radius: 12px;
    position: relative;
    transform: translateY(-24px);
  }

  .camera::after {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    background: radial-gradient(teal 10%, #333 30%, transparent 40%), #333;
    right: 9px;
    top: 9px;
    border-radius: 1.8px;
  }

  .lens {
    position: absolute;
    width: 48px;
    height: 48px;
    background: radial-gradient(circle at 60% 45%, khaki 0.6px, transparent 1.8px),
      radial-gradient(circle at 50% 40%, khaki 1.8px, transparent 3px),
      radial-gradient(cadetblue 12px, #555 12px, #555 15px, #333 15px, #333 24px);
    border-radius: 50%;
    top: 18px;
    left: 36px;
  }

  .lens::before,
  .lens::after {
    content: "";
    position: absolute;
    width: 30px;
    height: 0.6px;
    background-color: #333;
    left: 9px;
    animation: take-a-photo 3s infinite;
  }

  @keyframes take-a-photo {
    10% {
      height: calc(50% - 6px);
    }

    20% {
      height: 0.6px;
    }
  }

  .lens::before {
    top: 6px;
  }

  .lens::after {
    bottom: 6px;
  }

  .picture {
    position: absolute;
    width: inherit;
    height: 0px;
    top: 108px;
    overflow: hidden;
    animation: print 3s infinite;
  }

  @keyframes print {
    30% {
      height: 0px;
    }

    80%,
    100% {
      height: 90px;
    }
  }

  .picture::before {
    content: "";
    position: absolute;
    box-sizing: border-box;
    width: 90px;
    height: 90px;
    background: linear-gradient(45deg, #555 50%, #444 50%);
    left: 15px;
    border: solid linen;
    border-width: 0 6px 12px 6px;
    bottom: 0;
  }
}
</style>
