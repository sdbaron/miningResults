const PowerBit = require('./powerBit')

class PowerBits {
  constructor(powers) {
    this.powerBits = []
    this.add(powers)
  }
  
  /**
   *
   * @param {PowerBit|PowerBits[]} powerBits
   */
  add(powerBits) {
    this.powerBits.concat([].concat(powerBits.getItems ? powerBits.getItems() : powerBits).map(pb => pb.clone()))
  }
  
  getItems() {
    return this.powerBits
  }
  
  getPower(day = 0) {
    this.powerBits.reduce((bit, sum) => sum + bit.getPower(day), 0)
  }
}

module.exports = PowerBits