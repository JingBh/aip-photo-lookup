<template>
  <b-container id="container" class="text-center text-danger" style="margin-top: 20vh;">
    <p style="font-size: 10rem;"><b-icon-exclamation-triangle /></p>
    <h1 class="font-weight-light">
      拒绝访问
    </h1>
  </b-container>
</template>

<script>
import { BIconExclamationTriangle } from 'bootstrap-vue'

export default {
  auth: false,
  components: {
    BIconExclamationTriangle
  }
}
</script>
