const Balance = require('./balance')
const PowerBit = require('./powerBit')
const PowerBits = require('./powerBits')

class Farm {
  constructor(parameters, strategy, perfomanceBehavior, currencyRateBehavior, onDayInfo) {
    const params = Object.assign({}, parameters)
    this.powerBits = new PowerBits(params.powerBits)
    this.powerLimit = params.powerLimit
    this.maintenance = params.maintenance || 0
    this.fiatLimit = params.fiatLimit
    this.btcLimit = params.btcLimit
    this.investStrategy = strategy
    this.perfomanceBehavior = perfomanceBehavior
    this.currencyRateBehavior = currencyRateBehavior
    this.balance = new Balance({ converter: this.currencyRateBehavior })
    this.onDayInfo = onDayInfo
  }
  
  getCoins(day) {
    return this.powerBits.getPower(day) * this.perfomanceBehavior.getPerfomance(day)
  }
  
  setStrategy(strategy) {
    this.investStrategy = strategy
  }
  
  setPerfomanceBehavior(pb) {
    this.perfomanceBehavior = pb
  }
  
  setCurrencyRateBehavior(crb) {
    this.currencyRateBehavior = crb
    this.balance.setConverter(crb)
  }
  
  mine(days) {
    let day = 0
    const { powerLimit } = this
    for (; day < days; day++) {
      // выплата = намайненное минус обслуживание
      const payon = this.getCoins(day) * (1 - this.maintenance)
      this.balance.changeBtc(payon)
      const { howMachReinvest } = this.investStrategy.getInfoForDay(day, this.balance.btc)
      let reinvest
      if (howMachReinvest && (reinvest = howMachReinvest(day, this.balance.btc, this.currencyRateBehavior))) {
        const { spentFiat, spentBtc, additionalPower, investedBtc, investedFiat } = reinvest
        // ренивестируем
        if (additionalPower) {
          this.powerBits.add(new PowerBit(additionalPower, day))
        }
        let reinvestBtc
        let reinvestFiat
        if (spentBtc) {
          reinvestBtc = investedBtc - spentBtc
          this.balance.changeBtc(reinvestBtc)
        } else if (spentFiat) {
          reinvestFiat = investedFiat - spentFiat
          this.balance.changeFiat(reinvestFiat)
        }
        const dayPower = this.powerBits.getPower(day)
        const canceledInvest = powerLimit && dayPower > powerLimit
        if (canceledInvest) {
          const powerDifference = dayPower - powerLimit
          this.powerBits.sub(new PowerBit(-powerDifference, day))
          this.balance.changeBtc(this.investStrategy.getPowerPrice(powerDifference))
        }
        
        // отдадим callback функции информацию майнинге за день
        this.onDayInfo && this.onDayInfo({
          day,
          powerBits: this.powerBits,
          additionalPower,
          balanceBtc: this.balance.btc,
          balanceFiat: this.balance.fiat,
          reinvestBtc: -reinvestBtc,
          reinvestFiat: -reinvestFiat
        })
        
        if (canceledInvest) break
        if ((this.btcLimit && this.balance.btc >= this.btcLimit) || (this.fiatLimit && this.balance.fiat >= this.fiatLimit) ) break
      }
    }
    return day
  }
}

module.exports = Farm
