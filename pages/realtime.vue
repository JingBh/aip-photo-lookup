<template>
  <b-row>
    <b-col md="6" lg="8" class="text-center mb-3">
      <b-aspect id="video-container" aspect="16:9">
        <video ref="video" class="img-thumbnail" @loadedmetadata="videoEle.play()" />
        <face-mark
          v-for="(face, i) in responseFaces"
          :key="'face-' + i"
          :offset-left="faceMarkOffsetLeft"
          :offset-top="faceMarkOffsetTop"
          :vector="imageVector"
          :face="face"
          :static="responseFaces.length == 1"
        />
      </b-aspect>
    </b-col>
    <b-col md="6" lg="4" class="mb-3">
      <b-form-group v-if="videoStream" label="摄像头控制">
        <b-button block size="sm" variant="success" @click="flipVideoFacingMode">
          <b-icon-arrow-repeat />
          翻转摄像头
        </b-button>
      </b-form-group>
      <server-response v-if="serverResponse" class="my-4" :data="serverResponse" />
      <h4 v-else class="text-info my-4">
        <b-icon-circle-fill animation="throb" />
        实时检测进行中...
      </h4>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import * as faceApi from 'face-api.js'
import 'webrtc-adapter'

import { MultiSearchResponse, Face } from '~/lib/classes/AipTypes'
import FaceMark from '~/components/FaceMark.vue'
import ServerResponse from '~/components/ServerResponse.vue'

@Component({
  components: {
    FaceMark,
    ServerResponse
  },
  layout: 'main',
  middleware: 'check_access'
})
export default class RealtimePage extends Vue {
  @Ref('video') readonly videoEle!: HTMLVideoElement

  videoStream: MediaStream | null = null

  videoFacingUser: boolean = false

  timer: NodeJS.Timeout | null = null

  groups: string[] | null = null

  groupsEnabled: string[] | boolean = true

  serverResponse: MultiSearchResponse | null = null

  faceMarkOffsetLeft: number = 0

  faceMarkOffsetTop: number = 0

  imageVector: number = 1

  get videoConstraints(): MediaStreamConstraints {
    return {
      audio: false,
      video: {
        facingMode: this.videoFacingUser ? 'user' : 'environment'
      }
    }
  }

  get videoStreamInfo(): MediaTrackSettings {
    return this.videoStream?.getVideoTracks()[0].getSettings() as MediaTrackSettings
  }

  get responseFaces(): Face[] {
    if (this.serverResponse?.result) {
      return this.serverResponse.result.face_list
    } else {
      return []
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

  takePhoto(): Promise<void> {
    if (this.videoStream) {
      const canvas = document.createElement('canvas')
      canvas.width = Number(this.videoStreamInfo.width || 1920)
      canvas.height = Number(this.videoStreamInfo.height || 1080)
      const context = canvas.getContext('2d') as CanvasRenderingContext2D
      context.drawImage(this.videoEle, 0, 0, canvas.width, canvas.height)
      const image = canvas.toDataURL('image/jpeg', 0.8)
      return this.uploadImage(image)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise((resolve, reject) => {
        reject(new Error('Uninitialized video stream.'))
      })
    }
  }

  uploadImage(image: string) {
    return this.$axios.$post('/api/upload_image', {
      image,
      type: 'BASE64',
      groups: this.getGroupsEnabled()
    }, {
      progress: false
    }).then((response: MultiSearchResponse) => {
      this.serverResponse = response
    }).finally(() => {
      this.updateFaceMarkOffsets()
    })
  }

  updateGroups() {
    return this.$axios.$get('/api/groups').then((result: string[]) => {
      this.groups = result
    })
  }

  getGroupsEnabled() {
    if (this.groups === null) {
      return []
    } else if (this.groupsEnabled === true) {
      return this.groups
    } else if (typeof this.groupsEnabled === 'object') {
      return this.groupsEnabled
    } else {
      return []
    }
  }

  updateFaceMarkOffsets() {
    Vue.nextTick(() => {
      this.faceMarkOffsetLeft = this.videoEle.offsetLeft + 5
      this.faceMarkOffsetTop = this.videoEle.offsetTop + 5
      if (this.videoStreamInfo?.width) {
        this.imageVector = (this.videoEle.getBoundingClientRect().width - 10) / this.videoStreamInfo.width
      }
    })
  }

  initFaceDetection() {
    faceApi.nets.tinyFaceDetector.loadFromUri('/models').then(() => {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.doFaceDetection()
    })
  }

  doFaceDetection() {
    const groups = this.getGroupsEnabled()
    if (this.videoStream && groups.length > 0) {
      faceApi.detectSingleFace(this.videoEle, new faceApi.TinyFaceDetectorOptions({
        inputSize: 640,
        scoreThreshold: 0.6
      })).then((detection) => {
        if (detection) {
          this.takePhoto().then(() => (this.timer = setTimeout(this.doFaceDetection, 700)))
        } else {
          this.serverResponse = null
          this.timer = setTimeout(this.doFaceDetection, 300)
        }
        return detection
      })
    } else {
      this.timer = setTimeout(this.doFaceDetection, 500)
    }
  }

  onResize() {
    this.updateFaceMarkOffsets()
  }

  mounted() {
    window.addEventListener('resize', this.onResize)
    this.startVideoStream()
    this.updateGroups().then(() => this.initFaceDetection())
    this.updateFaceMarkOffsets()
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  }
}
</script>

<style lang="scss" scoped>
  #video-container {
    position: relative;
    margin: 0 auto;
    width: 100%;
    height: 100%;

    video {
      max-width: 100%;
      max-height: 100%;
    }
  }
</style>
