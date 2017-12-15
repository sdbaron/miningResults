const PerfomanceBehavior = require('./base')

class DecreasingPerfomance extends PerfomanceBehavior {
  constructor(perfomance){
    super(perfomance)
  }

  // сложность  медленно возрастает, производительность медленно падает
  getPerfomance(day = 0) {
    return this.perfomance * ( 1 - day * 0.00001)
  }
}

module.exports = DecreasingPerfomance