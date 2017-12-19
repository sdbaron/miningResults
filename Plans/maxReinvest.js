const ImmediatelyReinvestStrategy = require('../InvestStrategy/immediatelyReinvestStrategy')
const NoReinvestStrategy = require('../InvestStrategy/noReinvestStrategy')
const ConstantPerfomance = require('../PerfomanceBehavior/constant')
const ConstCryptoCurrencyRateBehavior = require('../CryptoCurrencyRateBehavior/constant')
const Farm = require('../farm')

class MaxReinvest {
  /**
   *
   * @param {Object} parameters
   * @param {number} parameters.miningDays Общая продолжительность манинга
   * @param {number} parameters.maxReinvestDays Максимальная длительность реинвестирования
   * @param {object} parameters.reinvestInfo Данные о лимитахреинвестирования
   * @param onDayInfo
   */
  constructor(parameters, onDayInfo) {
    const params = Object.assign({
      power: 30000,
      maintenance: 0.15,
      powerLimit: 100000,
    }, parameters)
    
    this.name = params.name || 'MaxReinvest'
    this.onDayInfo = onDayInfo
    this.miningDays = params.miningDays
    this.maxReinvestDays = params.maxReinvestDays || this.miningDays
    this.perfomanceBehavior = params.perfomanceBehavior
    this.currencyRateBehavior = params.currencyRateBehavior
    this.power = params.power
    this.maintenance = params.maintenance
    this.powerLimit = params.powerLimit
    this.fiatLimit = params.fiatLimit
    this.btcLimit = params.btcLimit
    this.reinvestInfo = params.reinvestInfo
  }
  
  start() {
    const strategy = new ImmediatelyReinvestStrategy(this.reinvestInfo)
    const farm = new Farm(
      { power: this.power,
        maintenance: this.maintenance,
        powerLimit: this.powerLimit,
        fiatMax: this.fiatLimit,
        btcLimit: this.btcLimit,
      },
      strategy,
      this.perfomanceBehavior,
      this.currencyRateBehavior,
      this.onDayInfo,
    )
    
    let stageDays = this.maxReinvestDays
    let executedDays = farm.mine(stageDays)
    
    let { btc, fiat } = farm.balance
    
    const stageReinvestResult = {
      name: `${this.name}:Reinvest.`,
      orderedDays: this.maxReinvestDays,
      executedDays: executedDays,
      power: farm.power,
      balance: { btc, fiat }
    }
    
    const ernStrategy = new NoReinvestStrategy({ perfomance: strategy.perfomance })
    farm.setStrategy(ernStrategy)
    // farm.setPerfomanceBehavior(perfomanceBehavior)
    stageDays = this.miningDays - executedDays
    executedDays = farm.mine(stageDays)
    
    const stageEarinigResult = {
      name: `${this.name}:Earning.`,
      orderedDays: this.maxReinvestDays,
      executedDays: executedDays,
      power: farm.power,
      balance: { btc: farm.balance.btc, fiat: farm.balance.fiat }
    }
    
    const summary = {
      name: `${this.name}`,
      orderedReinvestDays: stageReinvestResult.orderedDays,
      executedReinvestDays: stageReinvestResult.executedDays,
      orderedEarinigDays: stageEarinigResult.orderedDays,
      executedEarningDays: stageEarinigResult.executedDays,
      power: farm.power,
      balance: { btc: farm.balance.btc, fiat: farm.balance.fiat }
    }
    
    return [summary, stageReinvestResult, stageEarinigResult]
  }
}

module.exports = MaxReinvest
