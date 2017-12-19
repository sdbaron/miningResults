const PerfomanceBehavior = require('./base')

class LinearDecreasingPerfomance extends PerfomanceBehavior {
  constructor(start, last, period){
    super(start, period)
    this.lastPerfomance = last
    this.step = (last - start) / period
  }

  // сложность  медленно возрастает, производительность медленно падает
  getPerfomance(day = 0) {
    return this.perfomance +  (day + this.dayShift) * this.step
  }
}

module.exports = LinearDecreasingPerfomance