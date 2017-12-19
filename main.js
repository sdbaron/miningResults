const ConstantPerfomance = require('./PerfomanceBehavior/constant')
const LinearDecreasingPerfomance = require('./PerfomanceBehavior/decreasing')
const ConstCryptoCurrencyRateBehavior = require('./CryptoCurrencyRateBehavior/constant')
const findMaxProfit = require('./Plans/findMaxProfit')
const PowerBit = require('./powerBit')
const PowerBits = require('./powerBits')
const { REINVEST_BTC_DATA, BIT_BTC_PRICE, BIT_FIAT_PRICE } = require('./settings')

const { padEnd } = require('./settings')

const FARM_INIT = {
  powerBits: new PowerBits([new PowerBit(30000)]),
  maintenance: 0.15,
  powerLimit: 100000,
}

const PERFOMANCE = 0.0000001430
const RATE = 1 / 18000 // BTC / Dollar


const currencyRateBehavior = new ConstCryptoCurrencyRateBehavior(RATE)

const reinvestInfo = REINVEST_BTC_DATA
// сколько было вложено
const firstInvestment = 4500
const params = {
  maxMiningDays: 355, // всегод дней для майнинга
  fiatLimit: firstInvestment, // 4500, // майним, пока не вернём первоначальные инвкстиции
  btcLimit: null,
  perfomanceBehavior: null,
  currencyRateBehavior,
  shouldCollectDayInfo: false,
}

params.perfomanceBehavior = new LinearDecreasingPerfomance(PERFOMANCE, PERFOMANCE / 2, params.maxMiningDays)
// params.perfomanceBehavior = new ConstantPerfomance(PERFOMANCE)

params.fiatLimit = firstInvestment // майним, пока не получим 4500$
let stage = findMaxProfit(reinvestInfo, FARM_INIT, params)

let spentDays = stage.executedReinvestDays + stage.executedEarningDays
console.log(`\n Quickest way for return ${params.fiatLimit}$. Having farm power:${(FARM_INIT.powerBits.getPower() / 1000).toLocaleString()}TH/s Rate:${(1 / RATE)}$ for BTC\n`)
console.log(`${spentDays + ' days'} [investing ${stage.executedReinvestDays + 'days'} earning ${stage.executedEarningDays}days Power:${(stage.powerBits.getPower(spentDays - 1) / 1000).toLocaleString()}TH/s Balance:[ ${stage.balance.btc.toLocaleString() + ' btc'} or ${stage.balance.fiat.toLocaleString() + '$]'} \r`)

params.maxMiningDays -= spentDays
params.fiatLimit = null // майним без ограничения профита
params.perfomanceBehavior.setDayShift(spentDays)
// начнём с текущей мощности
const startPowerBits = stage.powerBits
console.log(`\n MAX profit plan for ${params.maxMiningDays} days and Rate:${(1 / RATE)}$ for BTC  start with Power:${(stage.powerBits.getPower(spentDays - 1) / 1000).toLocaleString()}TH/s:\n`)

// let prevStage = stage
const startDay = spentDays + 1
f()

function f() {
// for (let powerLimit = startPowerBits; powerLimit < 100000000;) {
  const powerLimit = 100000 * 1000
  const farmInit = Object.assign({}, FARM_INIT, { powerBits: startPowerBits, powerLimit })
  const stage = findMaxProfit(reinvestInfo, farmInit, params)
  const spentDays = stage.executedReinvestDays + stage.executedEarningDays
  const lastDay = spentDays + startDay
  console.log(`power limit: ${(farmInit.powerLimit / 1000).toLocaleString()}TH/s ${padEnd(spentDays + ' days', 4)} [investing ${padEnd(stage.executedReinvestDays + ' days', 9)} earning ${padEnd(stage.executedEarningDays + ' days]', 10)} currentPower: ${(stage.powerBits.getPower(lastDay - 1) / 1000).toLocaleString()}TH/s  Balance: [ ${padEnd(stage.balance.btc.toLocaleString() + ' btc', 10)} or ${padEnd(stage.balance.fiat.toLocaleString() + '$]', 20, 20)} \r`)
}


// if (!prevStage) prevStage = stage
// else {
//   if (stage.balance.btc <= prevStage.balance.btc) break
//   prevStage = stage
// }

//   (powerLimit >= 100000) || (powerLimit = 0)
//   powerLimit += 100000
// }


