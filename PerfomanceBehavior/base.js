class PerfomanceBehavior {
  constructor(perfomance){
    this.perfomance = perfomance
  }

  getPerfomance(day = 0){
    throw new Error('not implemented')
  }
}

module.exports = PerfomanceBehavior