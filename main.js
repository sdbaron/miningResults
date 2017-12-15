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
  constructor(parameters, strategy, perfomanceBehavior, currencyRateBehavior) {
    const params = Object.assign({ power: 30100, maintenance: 0.15 }, parameters)
    this.power = params.power
    this.maintenance = params.maintenance || 0
    this.investStrategy = strategy
    this.perfomanceBehavior = perfomanceBehavior
    this.currencyRateBehavior = currencyRateBehavior
    this.balance = new Balance({ converter: this.currencyRateBehavior })
  }

  getCoins(day) {
    return this.power * this.perfomanceBehavior.getPerfomance(day)
  }

  setStrategy(strategy){
    this.investStrategy = strategy
  }

  setPerfomanceBehavior(pb){
    this.perfomanceBehavior = pb
  }

  setCurrencyRateBehavior(crb){
    this.currencyRateBehavior = crb
    this.balance.setConverter(crb)
  }

  mine(days) {
    console.log(`${padEnd('day', 4)}: ${padEnd('power(GH/s)', 15)} ${padEnd('add Power(GH/s)', 20, 15)} ${padEnd('balance.btc', 20)} ${padEnd('balance.fiat', 20, 15)} ${padEnd('reinvestBtc', 20)} ${padEnd('reinvestFiat', 20, 16)}\r`)
    for (let day = 0; day < days; day++) {
      this.balance.changeBtc(this.getCoins(day))
      const { howMachReinvest } = this.investStrategy.getInfoForDay(day, this.balance.btc)
      let reinvest
      if (howMachReinvest && (reinvest = howMachReinvest(day, this.balance.btc, this.currencyRateBehavior ))) {
        const { spentFiat, spentBtc, additionalPower, investedBtc, investedFiat } = reinvest
        // ренивестируем
        if (additionalPower) {
          this.power += additionalPower
        }
        let reinvestBtc
        let reinvestFiat
        if (spentBtc) {
          reinvestBtc = investedBtc - spentBtc * (1 - this.maintenance)
          this.balance.changeBtc(reinvestBtc)
        } else if (spentFiat) {
          reinvestFiat = investedFiat - spentFiat * (1 - this.maintenance)
          this.balance.changeFiat(reinvestFiat)
        }
        console.log(`${padEnd(day, 4)}: ${padEnd(this.power, 15)} ${padEnd(additionalPower || 0, 20, 10)} ${padEnd(this.balance.btc, 20)} ${padEnd(this.balance.fiat, 20)} ${padEnd(-reinvestBtc || 0, 20)} ${padEnd(-reinvestFiat || 0, 20)}\r`)
      }
    }
  }
}


const strategy = new ImmediatelyReinvestStrategy()
// 0.000000154 btc by 1GH/s
const perfomanceBehavior = new ConstantPerfomance(0.000000154)
const currencyRateBehavior = new ConstCryptoCurrencyRateBehavior(1 / 16000)

const farm = new Farm({ power: 30100, maintenance: 0.15}, strategy, perfomanceBehavior, currencyRateBehavior)
const earnBtcDays = 50
farm.mine(365 - earnBtcDays)

const ernStrategy = new NoReinvestStrategy({perfomance: strategy.perfomance})
farm.setStrategy(ernStrategy)
farm.setPerfomanceBehavior(perfomanceBehavior)
farm.mine(earnBtcDays)

const { btc, fiat } = farm.balance

console.log(`Result: btc:${btc} fiat:${fiat} power:${farm.power}`)


function padEnd(value, width, trunc = 11){

  let s = typeof value === 'number' ? value.toLocaleString('ru') : '0' //  value.toString()
  return s.substr(0, trunc).padEnd(Math.max(width, s.length), ' ')
}