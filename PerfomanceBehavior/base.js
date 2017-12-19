class PerfomanceBehavior {
  constructor(perfomance, period){
    this.perfomance = perfomance
    this.period = period
    this.dayShift = 0
  }

  getPerfomance(day = 0){
    throw new Error('not implemented')
  }
  
  setDayShift(shift) {
    this.dayShift = shift
  }
}

module.exports = PerfomanceBehavior