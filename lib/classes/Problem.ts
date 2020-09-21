export enum ProblemLevel {
  INFO,
  WARN,
  ERROR
}

export default class Problem {
  level: ProblemLevel

  description: string

  constructor(level: ProblemLevel, description: string) {
    this.level = level
    this.description = description
  }
}
