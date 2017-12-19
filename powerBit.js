class PowerBit {
  constructor(power, startDay = 0, lifeTime = 365) {
    this.power = power
    this.startDay = startDay
    this.lifeTime = lifeTime
    this.lastDay = startDay + lifeTime
  }
  
  hasPower(day) {
    return (day >= this.startDay && day <= this.lastDay)
  }
  
  getPower(day) {
    return this.hasPower(day) ? this.power : 0
  }
  
  clone() {
    return new PowerBit(this.power, this.startDay, this.lifeTime)
  }
}

module.exports = PowerBit