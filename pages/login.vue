<template>
  <b-container class="my-5">
    <h1 class="font-weight-light text-center">
      正在登录，请稍候...
    </h1>
  </b-container>
</template>

<script>
export default {
  mounted() {
    this.$auth.loginWith('github')
  }
}
</script>
