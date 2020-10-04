<template>
  <div ref="ele" class="face-mark" :style="styles">
    <span v-if="user" class="face-name" :style="{ 'font-size': fontSize }">
      {{ userInfo ? userInfo.name : user.user_id }}
    </span>
    <div class="d-none">
      <div v-if="user" ref="tooltip">
        <h5 class="mb-1">
          {{ userInfo ? userInfo.name : user.user_id }}
          <span v-if="userInfo.gender === '男'" style="color: #39ccff" title="男">♂</span>
          <span v-else-if="userInfo.gender === '女'" style="color: #ff79fc" title="女">♀</span>
        </h5>
        <p v-if="userInfo" class="mb-0">
          ID：{{ user.user_id }}
        </p>
        <p v-if="userInfo.classid" class="mb-0">
          班级：{{ userInfo.classid }}
        </p>
        <p class="mb-0">
          相似度：{{ Math.round(user.score * 10) / 10 }}%
        </p>
      </div>
      <div v-else ref="tooltip" class="text-danger">
        未能识别此人的身份
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from 'vue-property-decorator'
import tippy, { Instance, sticky } from 'tippy.js'

import { Face, MatchUser } from '~/lib/classes/AipTypes'
import { UserInfo } from '~/lib/classes/UserInfo'

@Component
export default class ServerResponse extends Vue {
  @Prop({
    type: Number,
    default: 5
  }) readonly offsetLeft!: number

  @Prop({
    type: Number,
    default: 5
  }) readonly offsetTop!: number

  @Prop({
    type: Number,
    default: 1
  }) readonly vector!: number

  @Prop({
    type: Object,
    required: true
  }) readonly face!: Face

  @Prop({
    type: Boolean,
    default: false
  }) readonly static!: boolean

  @Ref('ele') readonly ele!: HTMLDivElement

  @Ref('tooltip') readonly tooltipEle!: HTMLDivElement

  tooltipInstance: Instance | null = null

  get location() {
    return this.face.location
  }

  get styles() {
    return {
      top: this.offsetTop + this.location.top * this.vector + 'px',
      left: this.offsetLeft + this.location.left * this.vector + 'px',
      width: this.face.location.width * this.vector + 'px',
      height: this.face.location.height * this.vector + 'px',
      transform: `rotate(${this.location.rotation}deg)`
    }
  }

  get fontSize() {
    return Math.min(this.face.location.width * this.vector * 0.2, 16) + 'px'
  }

  get user(): MatchUser | null {
    if (this.face.user_list.length > 0) {
      return this.face.user_list[0]
    } else {
      return null
    }
  }

  get userInfo(): UserInfo | null {
    // eslint-disable-next-line camelcase
    if (this.user?.user_info) {
      return JSON.parse(this.user.user_info) as UserInfo
    } else {
      return null
    }
  }

  initTooptip() {
    this.tooltipInstance = tippy(this.ele, {
      allowHTML: true,
      animation: 'scale',
      arrow: false,
      content: this.tooltipEle,
      hideOnClick: false,
      moveTransition: 'transform 0.2s ease-out',
      placement: 'right-end',
      plugins: [sticky],
      showOnCreate: this.static,
      sticky: true
    })
  }

  mounted() {
    this.initTooptip()
  }

  beforeDestroy() {
    this.tooltipInstance?.destroy()
  }
}
</script>

<style lang="scss" scoped>
  .face-mark {
    content: '';
    position: absolute;
    display: block;
    margin: 0;
    border: solid 0.15rem var(--primary);
    transform-origin: top left;
    transition: 0.2s ease-out;
    transition-property: top, left, transform;
    border-radius: 5%;
    user-select: none;
    opacity: 0.7;

    .face-name {
      position: absolute;
      top: calc(100% + 0.25rem);
      left: -0.15rem;
      min-width: calc(100% + 0.3rem);
      white-space: nowrap;
      text-align: center;
      font-weight: 500;
      color: black;
      background-color: rgba(255, 255, 255, 0.5);
      font-size-adjust: none;
    }

    &:hover {
      border: solid 0.25rem var(--success);

      .face-name {
        top: calc(100% + 0.35rem);
        left: -0.25rem;
        min-width: calc(100% + 0.5rem);
      }
    }
  }
</style>
