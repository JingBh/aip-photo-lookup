<script lang="ts">
import { CreateElement } from 'vue'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BIconInfoCircle, BIconExclamationTriangle, BIconXOctagon } from 'bootstrap-vue'
import Problem, { ProblemLevel } from '~/lib/classes/Problem'

@Component
export default class ProblemComponent extends Vue {
  @Prop(Object) readonly problem!: Problem

  render(h: CreateElement) {
    let icon: any, variant: string

    switch (this.problem.level) {
      case ProblemLevel.INFO:
        icon = BIconInfoCircle
        variant = 'info'
        break

      case ProblemLevel.WARN:
        icon = BIconExclamationTriangle
        variant = 'warning'
        break

      case ProblemLevel.ERROR:
        icon = BIconXOctagon
        variant = 'danger'
        break

      default:
        icon = null
        variant = 'secondary'
    }

    return h(
      'span', {
        class: ['text-' + variant]
      }, icon ? [
        h(icon),
        ' ', this.problem.description
      ] : this.problem.description
    )
  }
}
</script>
