const ConstantPerfomance = require('./PerfomanceBehavior/constant')
const LinearDecreasingPerfomance = require('./PerfomanceBehavior/decreasing')
const ConstCryptoCurrencyRateBehavior = require('./CryptoCurrencyRateBehavior/constant')
const findMaxProfit = require('./Plans/findMaxProfit')
const { REINVEST_BTC_DATA, BIT_BTC_PRICE, BIT_FIAT_PRICE } = require('./settings')

const { padEnd } = require('./settings')

const FARM_INIT = {
  power: 30000,
  maintenance: 0.15,
  powerLimit: 5000000,
}

const PERFOMANCE = 0.000000154
const RATE = 1 / 18000


const currencyRateBehavior = new ConstCryptoCurrencyRateBehavior(RATE)

const reinvestInfo = REINVEST_BTC_DATA
// сколько было вложено
const firstInvestment = FARM_INIT.power * BIT_FIAT_PRICE
const params = {
  maxMiningDays: 355, // всегод дней для майнинга
  fiatLimit: firstInvestment, // 4500, // майним, пока не вернём первоначальные инвкстиции
  btcLimit: null,
  perfomanceBehavior: null,
  currencyRateBehavior,
  shouldCollectDayInfo: false
}

// params.perfomanceBehavior = new LinearDecreasingPerfomance(PERFOMANCE, PERFOMANCE / 2, params.maxMiningDays)
params.perfomanceBehavior = new ConstantPerfomance(PERFOMANCE)

params.fiatLimit = firstInvestment // майним, пока не получим 4500$
let stage = findMaxProfit(reinvestInfo, FARM_INIT, params)

let spentDays = stage.executedReinvestDays + stage.executedEarningDays
console.log(`\n Quickest way for return ${params.fiatLimit}$. Having farm power:${(FARM_INIT.power / 1000).toLocaleString()}TH/s Rate:${(1 / RATE)}$ for BTC\n`)
console.log(`${spentDays + ' days'} [investing ${stage.executedReinvestDays + 'days'} earning ${stage.executedEarningDays}days Power:${stage.power.toLocaleString()}GH/s Balance:[ ${stage.balance.btc.toLocaleString() + ' btc'} or ${stage.balance.fiat.toLocaleString() + '$]'} \r`)

params.maxMiningDays -= spentDays
params.fiatLimit = null // майним без ограничения профита
params.perfomanceBehavior.setDayShift(spentDays)
// начнём с текщей мощности
const startPower = stage.power
console.log(`\n MAX profit plan for ${params.maxMiningDays} days and  Rate:${(1 / RATE)}$ for BTC:\n`)

let prevStage = stage

for (let powerLimit = startPower; powerLimit < 10000000;) {
  let stage = findMaxProfit(reinvestInfo, Object.assign({}, FARM_INIT, { powerLimit }), params)
  let spentDays = stage.executedReinvestDays + stage.executedEarningDays
  console.log(`power limit: ${(powerLimit / 1000).toLocaleString()}TH/s ${padEnd(spentDays + ' days', 4)} [investing ${padEnd(stage.executedReinvestDays + ' days', 9)} earning ${padEnd(stage.executedEarningDays + ' days]', 10)} currentPower: ${padEnd(stage.power, 15)} GH/s Balance: [ ${padEnd(stage.balance.btc.toLocaleString() + ' btc', 10)} or ${padEnd(stage.balance.fiat.toLocaleString() + '$]', 20, 20)} \r`)
  
  if (!prevStage) prevStage = stage
  else {
    if (stage.balance.btc <= prevStage.balance.btc) break
    prevStage = stage
  }
  
  (powerLimit >= 100000) || (powerLimit = 0)
  powerLimit += 100000
}


