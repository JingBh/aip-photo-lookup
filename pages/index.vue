<template>
  <b-container class="my-3">
    <h1 class="display-4 text-center my-3 my-md-5">
      {{ pageTitle }}
    </h1>
    <b-row>
      <b-col md="6" lg="8" class="text-center mb-3">
        <b-aspect id="image-container" aspect="16:9">
          <b-img
            v-show="imageUrl || !videoStream"
            :class="{ 'scanning': uploading }"
            :src="imageUrl"
            :blank="!imageUrl"
            :fluid="!!imageUrl"
            :fluid-grow="!imageUrl"
            blank-color="#aaa"
            thumbnail
          />
          <flash-effect v-show="doFlash" />
          <scan-effect v-show="uploading" />
          <div v-show="!imageUrl && videoStream" id="video-container">
            <video ref="video" class="img-thumbnail" @loadedmetadata="videoEle.play()" />
          </div>
        </b-aspect>
      </b-col>
      <b-col md="6" lg="4" class="mb-3">
        <b-overlay variant="white" spinner-variant="primary" :show="uploading">
          <b-form-group v-if="!imageUrl && videoStream" label="摄像头控制">
            <b-form-row>
              <b-col>
                <b-button block size="sm" variant="primary" @click="takePhoto">
                  <b-icon-camera />
                  拍照
                </b-button>
              </b-col>
              <b-col>
                <b-button block size="sm" variant="success" @click="flipVideoFacingMode">
                  <b-icon-arrow-repeat />
                  翻转摄像头
                </b-button>
              </b-col>
            </b-form-row>
          </b-form-group>
          <b-form-group v-if="!(imageUrl && !image)" label="选择图片" label-for="select-image">
            <b-form-file
              id="select-image"
              v-model="image"
              accept="image/*"
              browse-text="浏览"
              placeholder="请选择图片..."
              drop-placeholder="拖动图片到这里..."
              @input="onSelectImage"
            />
          </b-form-group>
          <b-button v-if="imageUrl" block size="sm" variant="danger" @click="image = null; onSelectImage()">
            <b-icon-x />
            取消选择图片
          </b-button>
          <b-button
            id="upload-button"
            block
            :size="(uploadable && !uploading) ? 'lg' : ''"
            :variant="uploadable ? 'primary' : 'secondary'"
            :disabled="uploading || !uploadable"
            @click="uploadImage"
          >
            <span v-if="uploadable">
              <b-icon-cloud-upload />
              上传并分析图片
            </span>
            <span v-else>若要上传，请先解决下列问题</span>
          </b-button>
          <div v-if="!uploadable" class="my-3">
            <ul class="list-unstyled">
              <li v-for="(problem, i) in problems" :key="'problem-' + i">
                <problem-component :problem="problem" />
              </li>
            </ul>
          </div>
        </b-overlay>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import 'webrtc-adapter'

import Problem, { ProblemLevel } from '~/lib/classes/Problem'
import ProblemComponent from '~/components/Problem.vue'
import FlashEffect from '~/components/FlashEffect.vue'
import ScanEffect from '~/components/ScanEffect.vue'

@Component({
  components: {
    FlashEffect,
    ProblemComponent,
    ScanEffect
  },
  middleware: 'check_access'
})
export default class IndexPage extends Vue {
  image: File|null = null

  imageUrl: string|null = null

  doFlash: boolean = false

  doFlashTimer: NodeJS.Timeout|null = null

  @Ref('video') readonly videoEle!: HTMLVideoElement

  videoStream: MediaStream|null = null

  videoFacingUser: boolean = false

  problems: Array<Problem> = []

  serverInfos: Array<Problem> = []

  uploading: boolean = false

  get pageTitle(): string|undefined {
    return this.$config.title
  }

  get uploadable(): boolean {
    return this.problems.length === 0
  }

  get videoConstraints(): MediaStreamConstraints {
    return {
      audio: false,
      video: {
        facingMode: this.videoFacingUser ? 'user' : 'environment'
      }
    }
  }

  flipVideoFacingMode() {
    this.videoFacingUser = !this.videoFacingUser
    // this.startVideoStream()
  }

  startVideoStream() {
    this.videoStream = null
    navigator.mediaDevices.getUserMedia(this.videoConstraints)
      .then((stream: MediaStream) => {
        this.videoStream = stream
        this.videoEle.srcObject = stream
      })
  }

  takePhoto() {
    this.doFlash = false
    if (!this.imageUrl && this.videoStream) {
      /* Flash Start */
      Vue.nextTick(() => {
        if (this.doFlashTimer) {
          clearTimeout(this.doFlashTimer)
        }
        this.doFlash = true
        Vue.nextTick(() => {
          this.doFlashTimer = setTimeout(() => {
            this.doFlash = false
          }, 600)
        })
      })
      /* Flash End */
      const videoInfo = this.videoStream.getVideoTracks()[0].getSettings()
      const canvas = document.createElement('canvas')
      canvas.width = Number(videoInfo.width || 1920)
      canvas.height = Number(videoInfo.height || 1080)
      const context = canvas.getContext('2d') as CanvasRenderingContext2D
      context.drawImage(this.videoEle, 0, 0, canvas.width, canvas.height)
      this.imageUrl = canvas.toDataURL()
      this.detectProblems()
    }
  }

  onSelectImage() {
    if (this.image != null) {
      const reader = new FileReader()
      reader.readAsDataURL(this.image)
      reader.onload = () => {
        this.imageUrl = (reader.result || '').toString()
      }
    } else {
      this.imageUrl = null
    }
    this.detectProblems()
  }

  detectProblems() {
    const problems = []
    if (!this.imageUrl) {
      problems.push(new Problem(ProblemLevel.INFO, '请先选择或拍摄一张图片'))
    } else if (this.imageUrl.length > 2 * 1024 * 1024) {
      // Must be smaller than 2MB
      problems.push(new Problem(ProblemLevel.ERROR, '由于系统限制，图片大小必须小于 2MB'))
    }
    this.problems = problems
    this.serverInfos = []
  }

  uploadImage() {
    this.detectProblems()
    if (this.problems.length === 0) {
      this.uploading = true
      // TODO: Upload the image
    }
  }

  mounted() {
    this.startVideoStream()
    this.detectProblems()
  }
}
</script>

<style lang="scss" scoped>
  #upload-button {
    transition-duration: 0.3s;
    transition-property: font-size, line-height;
  }

  #image-container {
    position: relative;
    width: 100%;

    img {
      position: relative;
      display: block;
      left: 0;
      top: 0;
      margin: 0 auto;
      max-height: 70vh;
    }

    #video-container {
      position: absolute;
      left: 0;
      top: 0;
      margin: 0 auto;
      width: 100%;
      height: 100%;
      text-align: center;

      video {
        max-width: 100%;
        max-height: 100%;
      }
    }

    .flash-effect {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
</style>
