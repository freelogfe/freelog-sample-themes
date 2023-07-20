<!-- loading 动画 -->

<template>
  <div class="loader-wrapper">
    <div class="book">
      <div class="static-page">
        <span v-for="(_, index) in 5" :key="'left' + index"></span>
      </div>
      <div class="static-page right">
        <span v-for="(_, index) in 5" :key="'right' + index"></span>
      </div>
      <div class="page">
        <span v-for="(_, index) in 5" :key="'rotate' + index"></span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loader-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;

  .book {
    position: relative;
    --sw: 5px; /* stroke width */
    width: 150px;
    height: 100px;
    background-color: rgb(239, 239, 239);
    border: var(--sw) solid #666;
    border-radius: var(--sw);
    box-sizing: border-box;

    .static-page {
      height: inherit;
      width: calc(50% + var(--sw) + var(--sw) / 2);
      background-color: inherit;
      border: inherit;
      border-radius: inherit;
      position: absolute;
      top: calc(-1 * var(--sw));
      left: calc(-1 * var(--sw));
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 8% 5%;
      box-sizing: border-box;

      &.right {
        left: auto;
        right: calc(-1 * var(--sw));
      }

      span {
        display: block;
        width: 100%;
        border-top: var(--sw) solid #666;
        border-radius: inherit;
        transform: scaleX(1);
      }
    }

    .page {
      height: inherit;
      width: calc(50% + var(--sw) + var(--sw) / 2);
      background-color: inherit;
      border: inherit;
      border-radius: inherit;
      position: absolute;
      top: calc(-1 * var(--sw));
      right: calc(-1 * var(--sw));
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 8% 5%;
      animation: flip 3s linear infinite;
      transform-origin: left;
      transform-style: preserve-3d;
      box-sizing: border-box;

      span {
        display: block;
        width: 100%;
        border-top: var(--sw) solid #666;
        border-radius: inherit;
        transform: scaleX(1);
      }
    }
  }

  @keyframes flip {
    55% {
      transform: rotateY(0) translateX(0) skewY(0);
    }

    70% {
      transform: rotateY(-90deg) translateX(calc(-1 * var(--sw) / 2)) skewY(-20deg);
    }

    80%,
    100% {
      transform: rotateY(-180deg) translateX(calc(-1 * var(--sw))) skewY(0);
    }
  }
}
</style>
