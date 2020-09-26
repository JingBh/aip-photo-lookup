<template>
  <div class="scan-effect" />
</template>

<style lang="scss" scoped>
  .scan-effect {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 1px;
    background-color: #72c0f0;
    border-radius: 50% 50% 10% 10%;
    box-shadow: 0px 1px 5px 6px #72c0f0;
    user-select: none;
    pointer-events: none;
    animation: scan 3s infinite;
    z-index: 1;
  }

  @keyframes scan {
    0% {
      top: 0;
    }

    50% {
      top: 100%;
    }

    100% {
      top: 0;
    }
  }
</style>
