<template>
  <div v-if="successful" class="text-success">
    <h4 v-if="successful">
      <b-icon-check-circle /> 已完成分析
    </h4>
    <p class="lead">
      共检测到 {{ data.result.face_num }} 个人脸。<br>
      <span v-if="data.result.face_num > 1">鼠标悬浮或点击人脸框来查看详情。</span>
    </p>
    <p v-if="data.result.face_num == 10" class="text-warning small">
      由于系统限制，只能识别最多 10 个人脸。若图片中有多于 10 个人，则无法正确识别。
    </p>
  </div>
  <div v-else class="text-danger">
    <h4 class="mb-3">
      <b-icon-x-circle /> 请求失败
    </h4>
    <p class="mb-1">
      <strong>错误代码：</strong>{{ data.error_code }}
    </p>
    <p class="mb-0">
      <strong>错误信息：</strong>{{ data.error_msg }}
    </p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { MultiSearchResponse } from '~/lib/classes/AipTypes'

@Component
export default class ServerResponse extends Vue {
  @Prop(Object) readonly data!: MultiSearchResponse

  get successful(): boolean {
    return this.data.error_code === 0
  }
}
</script>
