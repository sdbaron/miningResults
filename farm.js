const ImmediatelyReinvestStrategy = require('./InvestStrategy/immediatelyReinvestStrategy')
const NoReinvestStrategy = require('./InvestStrategy/noReinvestStrategy')
const ConstantPerfomance = require('./PerfomanceBehavior/constant')
const ConstCryptoCurrencyRateBehavior = require('./CryptoCurrencyRateBehavior/constant')

class Balance {
  constructor(parameters) {
    const params = Object.assign({ fiat: 0, btc: 0 }, parameters)
    this.converter = params.converter
    this.fiat = params.fiat || 0
    this.btc = params.btc || 0
  }

  changeFiat(addValue, day) {
    this.fiat += addValue
    this.btc = this.converter.convertToBtc(this.fiat, day)
  }

  changeBtc(addValue, day) {
    this.btc += addValue
    this.fiat = this.converter.convertToFiat(this.btc, day)
  }

  setConverter(converter) {
    this.converter = converter
  }
}


class Farm {
  constructor(parameters, strategy, perfomanceBehavior, currencyRateBehavior, onDayInfo) {
    const params = Object.assign({ power: 30100, maintenance: 0.15 }, parameters)
    this.power = params.power
    this.maintenance = params.maintenance || 0
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
    for (let day = 0; day < days; day++) {
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
        this.onDayInfo && this.onDayInfo({
          day,
          power: this.power,
          additionalPower,
          balanceBtc: this.balance.btc,
          balanceFiat: this.balance.fiat,
          reinvestBtc: -reinvestBtc,
          reinvestFiat: -reinvestFiat
        })
      }
    }
  }
}

module.exports = Farm
