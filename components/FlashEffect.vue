<template>
  <div class="flash-effect" />
</template>

<style lang="scss" scoped>
  .flash-effect {
    width: 100%;
    height: 100%;
    background-color: white;
    user-select: none;
    pointer-events: none;
    animation: flash 0.6s;
    opacity: 0;
    z-index: 1;
  }

  @keyframes flash {
    0% {
      opacity: 0;
    }

    50% {
      opacity: 0.8;
    }

    100% {
      opacity: 0;
    }
  }
</style>
