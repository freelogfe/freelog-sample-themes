<!-- loading 动画 -->

<template>
  <div class="loader-wrapper">
    <div class="signboard">
      <div class="sign">LOADING</div>
      <div class="strings"></div>
      <div class="pin top"></div>
      <div class="pin left"></div>
      <div class="pin right"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loader-wrapper {
  width: 100%;
  padding-top: 100px;
  display: flex;
  justify-content: center;

  .signboard {
    width: 200px;
    height: 150px;
    position: relative;
    animation: swinging 1.5s ease-in-out infinite alternate;
    transform-origin: 100px 6.5px;

    .sign {
      width: 100%;
      height: 100px;
      background: burlywood;
      border-radius: 6.5px;
      position: absolute;
      bottom: 0;
      font-size: 35px;
      color: saddlebrown;
      font-family: serif;
      font-weight: bold;
      text-align: center;
      line-height: 100px;
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3), 0 -1px 0 rgba(0, 0, 0, 0.7);
    }

    .strings {
      width: 75px;
      height: 75px;
      border: 2.5px solid brown;
      position: absolute;
      border-right: none;
      border-bottom: none;
      transform: rotate(45deg);
      top: 19px;
      left: 61px;
    }

    .pin {
      width: 12.5px;
      height: 12.5px;
      border-radius: 50%;
      position: absolute;

      &.top {
        background: gray;
        left: 93.5px;
      }

      &.left,
      &.right {
        background: brown;
        top: 55px;
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      &.left {
        left: 40px;
      }

      &.right {
        right: 40px;
      }
    }
  }
}

@keyframes swinging {
  from {
    transform: rotate(10deg);
  }
  to {
    transform: rotate(-10deg);
  }
}
</style>
