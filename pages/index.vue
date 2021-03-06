<template>
  <b-row @drop.prevent="onDropFile" @dragover.prevent>
    <b-col md="6" lg="8" class="text-center mb-3">
      <b-aspect id="image-container" :aspect="aspect">
        <b-img
          v-show="imageUrl || !videoStream"
          ref="image"
          :class="{ 'scanning': uploading }"
          :src="imageUrl"
          :blank="!imageUrl"
          :fluid-grow="!imageUrl"
          blank-color="#aaa"
          thumbnail
          @load="onImageLoad"
          @error="imageSize = [0, 0]"
        />
        <flash-effect v-if="doFlash" />
        <scan-effect v-if="uploading" />
        <div v-show="!imageUrl && videoStream" id="video-container">
          <video ref="video" class="img-thumbnail" @loadedmetadata="videoEle.play()" />
        </div>
        <face-mark
          v-for="(face, i) in responseFaces"
          :key="'face-' + i"
          :offset-left="faceMarkOffsetLeft"
          :offset-top="faceMarkOffsetTop"
          :vector="imageVector"
          :face="face"
          :static="face.user_list.length > 0 && i < 2"
        />
      </b-aspect>
    </b-col>
    <b-col md="6" lg="4" class="mb-3">
      <b-overlay variant="white" spinner-variant="primary" :show="uploading || loading">
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
        <b-form-group
          v-if="(imageType === 'BASE64' || !imageUrl) && !(imageUrl && !image)"
          key="select-image"
          label="选择图片"
          label-for="select-image"
        >
          <b-form-file
            id="select-image"
            v-model="image"
            accept="image/jpeg, image/png"
            browse-text="浏览"
            placeholder="请选择图片..."
            drop-placeholder="拖动文件到这里..."
            @input="onSelectImage"
          />
        </b-form-group>
        <b-form-group
          v-if="imageType === 'URL' || !imageUrl"
          key="input-image-url"
          label="或输入图片 URL"
          label-for="input-image-url"
        >
          <b-form-input
            v-model="imageUrl"
            placeholder="请输入图片 URL"
            @input="onInputImageUrl"
          />
        </b-form-group>
        <b-form-group v-if="imageUrl" key="image-control">
          <b-button-group class="w-100 mb-2" size="sm">
            <b-button variant="danger" @click="image = null; onSelectImage()">
              <b-icon-trash />
              清空图片
            </b-button>
            <b-button v-if="imageTooLarge && imageCompressable" variant="info" @click="compressImage">
              <b-icon-arrows-angle-contract />
              压缩图片
            </b-button>
          </b-button-group>
          <b-button
            id="upload-button"
            block
            :size="(uploadable && !uploading) ? 'lg' : ''"
            :variant="uploadable ? 'primary' : 'secondary'"
            :disabled="uploading || !uploadable"
            @click="uploadImage"
          >
            <span v-if="uploadable">
              <!-- TODO: Scan only specified group. -->
              <b-icon-cloud-upload />
              上传并分析图片
            </span>
            <span v-else>若要上传，请先解决下列问题</span>
          </b-button>
        </b-form-group>
        <div v-if="!uploadable" class="my-3">
          <ul class="list-unstyled">
            <li v-for="(problem, i) in problems" :key="'problem-' + i" class="my-1">
              <problem-component :problem="problem" />
            </li>
          </ul>
          <b-card v-if="imageTooLarge" img-src="https://tinify.cn/images/panda-chewing-2x.png" img-left img-width="40%">
            <b-card-text>
              您可以尝试使用
              <b-link href="https://tinify.cn/" target="_blank">
                TinyPNG
              </b-link>
              或
              <b-link href="https://imagecompressor.com/zh/" target="_blank">
                Optimizilla
              </b-link>
              等工具压缩图片后再上传。
            </b-card-text>
          </b-card>
        </div>
        <hr v-if="!uploadable && serverResponse">
        <server-response v-if="serverResponse" class="my-4" :data="serverResponse" />
      </b-overlay>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import 'webrtc-adapter'

import Problem, { ProblemLevel } from '~/lib/classes/Problem'
import { MultiSearchResponse, Face } from '~/lib/classes/AipTypes'
import ProblemComponent from '~/components/Problem.vue'
import FaceMark from '~/components/FaceMark.vue'
import ServerResponse from '~/components/ServerResponse.vue'
import FlashEffect from '~/components/FlashEffect.vue'
import ScanEffect from '~/components/ScanEffect.vue'

@Component({
  components: {
    ProblemComponent,
    FaceMark,
    ServerResponse,
    FlashEffect,
    ScanEffect
  },
  layout: 'main',
  middleware: 'check_access'
})
export default class IndexPage extends Vue {
  image: File | null = null

  imageType: 'BASE64' | 'URL' | 'FACE_TOKEN' = 'BASE64'

  imageUrl: string | null = null

  @Ref('image') readonly imageEle!: HTMLImageElement

  imageSize: [number, number] = [0, 0]

  doFlash: boolean = false

  doFlashTimer: NodeJS.Timeout | null = null

  @Ref('video') readonly videoEle!: HTMLVideoElement

  videoStream: MediaStream | null = null

  videoFacingUser: boolean = false

  uploading: boolean = false

  loading: boolean = false

  groups: string[] = []

  groupsEnabled: string[] | boolean = true

  serverResponse: MultiSearchResponse | null = null

  faceMarkOffsetLeft: number = 0

  faceMarkOffsetTop: number = 0

  imageVector: number = 1

  aspect: number = 16 / 9

  get imageTooLarge(): boolean {
    // if (this.imageSize[0] > 1920 || this.imageSize[1] > 1080) {
    if (this.imageSize[0] > 2000 && this.imageSize[1] > 2000) {
      return true
    } else if (this.imageUrl) {
      // 大于 2MB 无法上传百度
      const base64 = this.imageUrl.substring(this.imageUrl.indexOf(',') + 1)
      const fileLength = base64.length / 4 * 3
      return fileLength > 2 * 1024 * 1024
    } else {
      return false
    }
  }

  get imageCompressable(): boolean {
    // 小于 5MB 可压缩
    if (this.imageUrl && this.imageType === 'BASE64' && this.imageTooLarge) {
      const base64 = this.imageUrl.substring(this.imageUrl.indexOf(',') + 1)
      const fileLength = base64.length / 4 * 3
      return fileLength <= 5 * 1024 * 1024
    } else {
      return false
    }
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

  get responseFaces(): Face[] {
    if (this.serverResponse?.result) {
      return this.serverResponse.result.face_list
    } else {
      return []
    }
  }

  get problems(): Problem[] {
    const problems = []
    if (!this.imageUrl) {
      problems.push(new Problem(ProblemLevel.WARN, '请先选择或拍摄一张图片'))
    } else if (this.imageTooLarge) {
      problems.push(new Problem(ProblemLevel.ERROR, '由于系统限制，图片大小必须小于 2MB，且小于 1920 × 1080 像素。'))
      if (this.imageCompressable) {
        problems.push(new Problem(ProblemLevel.INFO, '您可以尝试点击上面的“压缩图片”按钮进行自动压缩。'))
      }
    }
    return problems
  }

  flipVideoFacingMode() {
    this.videoFacingUser = !this.videoFacingUser
    this.startVideoStream()
  }

  startVideoStream() {
    this.videoStream = null
    navigator.mediaDevices.getUserMedia(this.videoConstraints)
      .then((stream: MediaStream) => {
        this.videoStream = stream
        this.videoEle.srcObject = stream
        const videoInfo = this.videoStream.getVideoTracks()[0].getSettings()
        this.aspect = Number(videoInfo.width || 1920) / Number(videoInfo.height || 1080)
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
      this.imageUrl = canvas.toDataURL('image/jpeg', 0.8)
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
    this.serverResponse = null
    this.imageType = 'BASE64'
  }

  onInputImageUrl() {
    this.image = null
    this.serverResponse = null
    this.imageType = 'URL'
  }

  onDropFile(event: DragEvent) {
    if (event.dataTransfer?.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item: DataTransferItem = event.dataTransfer.items[i]
        switch (item.kind) {
          case 'file':
            this.image = item.getAsFile()
            this.onSelectImage()
            return
          case 'string':
            if (item.type === 'text/uri-list') {
              item.getAsString((url) => {
                this.imageUrl = url
                if (url.substring(0, 5).toLowerCase() === 'data:') {
                  this.imageType = 'BASE64'
                } else {
                  this.imageType = 'URL'
                  this.onInputImageUrl()
                }
              })
              return
            }
            break
        }
      }
    }
  }

  compressImage() {
    if (this.imageCompressable) {
      this.serverResponse = null
      this.loading = true
      this.$axios.$post('/api/compress_image', {
        image: this.imageUrl
      }).then((result: [boolean, string, string | null]) => {
        if (result[0] === true && result[2]) {
          this.image = null
          this.imageUrl = result[2]
        } else {
          alert('压缩图片失败！' + (result[1] ? '\n' + result[1] : ''))
        }
      }).finally(() => (this.loading = false))
    }
  }

  uploadImage() {
    if (this.problems.length === 0) {
      this.serverResponse = null
      this.uploading = true
      /* if (this.imageType === 'URL') {
        const canvas = document.createElement('canvas')
        canvas.width = Number(this.imageEle.naturalWidth || 1920)
        canvas.height = Number(this.imageEle.naturalHeight || 1080)
        const context = canvas.getContext('2d') as CanvasRenderingContext2D
        this.imageEle.crossOrigin = 'Anonymous'
        context.drawImage(this.imageEle, 0, 0, canvas.width, canvas.height)
        this.imageUrl = canvas.toDataURL('image/jpeg', 0.8)
        this.imageType = 'BASE64'
      } */
      this.$axios.$post('/api/upload_image', {
        image: this.imageUrl,
        type: this.imageType,
        groups: this.getGroupsEnabled()
      }).then((response: MultiSearchResponse) => {
        this.serverResponse = response
        console.log(response)
      }).finally(() => {
        this.uploading = false
        this.updateFaceMarkOffsets()
      })
    }
  }

  updateGroups() {
    this.loading = true
    this.$axios.$get('/api/groups').then((result: string[]) => {
      this.groups = result
    }).finally(() => (this.loading = false))
  }

  getGroupsEnabled() {
    if (this.groupsEnabled === true) {
      return this.groups
    } else if (typeof this.groupsEnabled === 'object') {
      return this.groupsEnabled
    } else {
      return []
    }
  }

  updateFaceMarkOffsets() {
    Vue.nextTick(() => {
      this.faceMarkOffsetLeft = this.imageEle.offsetLeft + 5
      this.faceMarkOffsetTop = this.imageEle.offsetTop + 5
      this.imageVector = (this.imageEle.getBoundingClientRect().width - 10) / this.imageEle.naturalWidth
    })
  }

  onImageLoad() {
    this.updateFaceMarkOffsets()
    this.imageSize = [this.imageEle.naturalWidth, this.imageEle.naturalHeight]
  }

  onResize() {
    this.updateFaceMarkOffsets()
  }

  mounted() {
    window.addEventListener('resize', this.onResize)
    this.startVideoStream()
    this.updateGroups()
    this.updateFaceMarkOffsets()
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
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
