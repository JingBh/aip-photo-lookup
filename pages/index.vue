<template>
  <b-container class="my-3">
    <h1 class="display-4 text-center my-3 my-md-5">
      {{ pageTitle }}
    </h1>
    <b-row>
      <b-col md="6" lg="8" class="text-center mb-3">
        <b-img
          id="image"
          :src="imageUrl"
          :blank="!imageUrl"
          :fluid="!!imageUrl"
          :fluid-grow="!imageUrl"
          blank-color="#aaa"
          thumbnail
        />
      </b-col>
      <b-col md="6" lg="4" class="mb-3">
        <b-form-group label="选择图片" label-for="select-image">
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
        <b-button
          block
          :size="uploadable ? 'lg' : 'sm'"
          variant="primary"
          :disabled="!uploadable"
          style="transition-duration: 0.3s; transition-property: font-size, line-height;"
          @click="uploadImage"
        >
          {{ uploadable ? '上传并分析图片' : '请先解决下列问题' }}
        </b-button>
        <div v-if="!uploadable" class="my-3">
          <ul class="list-unstyled">
            <li v-for="(problem, i) in problems" :key="'problem-' + i">
              <problem-component :problem="problem" />
            </li>
          </ul>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Problem, { ProblemLevel } from '~/lib/classes/Problem'
import ProblemComponent from '~/components/Problem.vue'

@Component({
  components: {
    ProblemComponent
  }
})
export default class IndexPage extends Vue {
  image: File|null = null

  imageUrl: string|null = null

  problems: Array<Problem> = []

  get pageTitle(): string|undefined {
    return process.env.title
  }

  get uploadable(): boolean {
    this.detectProblems()
    return this.problems.length === 0
  }

  onSelectImage() {
    if (this.image != null) {
      const reader = new FileReader()
      reader.readAsDataURL(this.image)
      reader.onload = () => {
        this.imageUrl = (reader.result || '').toString()
      }
    } else { this.imageUrl = null }
    this.detectProblems()
  }

  detectProblems() {
    const problems = []
    if (!this.imageUrl) {
      problems.push(new Problem(ProblemLevel.INFO, '请选择图片'))
    } else if (this.imageUrl.length > 2 * 1024 * 1024) {
      // Must be smaller than 2MB
      problems.push(new Problem(ProblemLevel.ERROR, '由于系统限制，图片大小必须小于 2MB'))
    }
    this.problems = problems
  }

  uploadImage() {

  }

  mounted() {
    this.detectProblems()
  }
}
</script>

<style lang="scss" scoped>
  #image {
    position: relative;
    max-height: 70vh;

    &.scanning:after {
      content: '';
      left: 0;
      top: 0;
    }
  }
</style>
