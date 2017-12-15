const PerfomanceBehavior = require('./base')

class ConstantPerfomance extends PerfomanceBehavior {
  constructor(perfomance){
    super(perfomance)
  }

  getPerfomance(){
    return this.perfomance
  }
}

module.exports = ConstantPerfomance