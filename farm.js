const ImmediatelyReinvestStrategy = require('./InvestStrategy/immediatelyReinvestStrategy')
const NoReinvestStrategy = require('./InvestStrategy/noReinvestStrategy')
const ConstantPerfomance = require('./PerfomanceBehavior/constant')
const ConstCryptoCurrencyRateBehavior = require('./CryptoCurrencyRateBehavior/constant')
const Balance = require('./balance')

class Farm {
  constructor(parameters, strategy, perfomanceBehavior, currencyRateBehavior, onDayInfo) {
    const params = Object.assign({ power: 30100, maintenance: 0.15, powerLimit: 200000 }, parameters)
    this.power = params.power
    this.powerLimit = params.powerLimit || 200000
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
    return this.power * this.perfomanceBehavior.getPerfomance(day)
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
          this.power += additionalPower
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
        const canceledInvest = this.power > powerLimit
        if (canceledInvest) {
          const powerDifference = this.power - powerLimit
          this.power = powerLimit
          this.balance.changeBtc(this.investStrategy.getPowerPrice(powerDifference))
        }
        
        this.onDayInfo && this.onDayInfo({
          day,
          power: this.power,
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
