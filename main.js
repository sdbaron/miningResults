const ImmediatelyReinvestStrategy = require('./InvestStrategy/immediatelyReinvestStrategy')
const NoReinvestStrategy = require('./InvestStrategy/noReinvestStrategy')
const ConstantPerfomance = require('./PerfomanceBehavior/constant')
const ConstCryptoCurrencyRateBehavior = require('./CryptoCurrencyRateBehavior/constant')
const MaxReinvestPlan = require('./Plans/maxReinvest')

const FARM_INIT = {
  power: 30000,
  maintenance: 0.15,
  powerLimit: 100000,
}

const PERFOMANCE = 0.000000154
const RATE = 1 / 15000

let bestStage = null
const fiatLimit = 4500
for (let miningDays = 20; miningDays < 350; miningDays++){
  const stage = checkPlan(miningDays, fiatLimit)
  if (fiatLimit && stage.balance.fiat <= fiatLimit) continue
  if (!bestStage ||
    (stage.balance.btc >= bestStage.balance.btc
    && (stage.executedReinvestDays + stage.executedEarningDays) <= (bestStage.executedReinvestDays + bestStage.executedEarningDays)
    )
  ) {
    bestStage = stage
  }
}
const stage = bestStage
console.log(`Stage: ${padEnd(stage.name, 25, 25)} ${padEnd(stage.executedReinvestDays + stage.executedEarningDays + ' days', 4)} invest days:${padEnd(stage.executedReinvestDays, 4)} earned days:${padEnd(stage.executedEarningDays, 15)} currentPower: ${padEnd(stage.power, 15)} GH/s Balance: { ${padEnd(stage.balance.btc, 15)}btc or ${padEnd(stage.balance.fiat, 15)}$ }\r`)


function checkPlan(miningDays, fiatLimit) {
  const results = []
  for (let maxReinvestDays = miningDays; maxReinvestDays >= 0; maxReinvestDays--) {
    const perfomanceBehavior = new ConstantPerfomance(PERFOMANCE)
    const currencyRateBehavior = new ConstCryptoCurrencyRateBehavior(RATE)
    const plan = new MaxReinvestPlan(Object.assign(
      {
        name: `MaxReinvest ${maxReinvestDays}`,
        miningDays: miningDays,
        maxReinvestDays: maxReinvestDays,
        perfomanceBehavior: perfomanceBehavior,
        currencyRateBehavior: currencyRateBehavior,
        fiatLimit: fiatLimit
      },
      FARM_INIT,
      ),
      // (dayInfo) => {
      //   console.log(`${padEnd(dayInfo.day, 4)}: ${padEnd(dayInfo.power, 15)} ${padEnd(dayInfo.additionalPower || 0, 20, 10)} ${padEnd(dayInfo.balanceBtc, 20)} ${padEnd(dayInfo.balanceFiat, 20)} ${padEnd(dayInfo.minValueBtcForReinvest || 0, 20)} ${padEnd(dayInfo.reinvestFiat || 0, 20)}\r`)
      //   // console.log(`${padEnd(dayInfo.day + ':', 4)} ${padEnd(dayInfo.power, 15)} ${padEnd(dayInfo.additionalPower || 0, 20, 10)} ${padEnd(dayInfo.balanceBtc, 20)} ${padEnd(dayInfo.minValueBtcForReinvest || 0, 20)}\r`)
      // }
    )
    const stages = plan.start()
    results.push(stages[0])
  }
  
  let bestStage = null
  results.forEach(stage => {
    // console.log(`Stage: ${padEnd(stage.name, 25, 25)} invest days:${padEnd(stage.executedReinvestDays, 4)} earned days:${padEnd(stage.executedEarningDays, 15)} currentPower: ${padEnd(stage.power, 15)} GH/s Balance: { ${padEnd(stage.balance.btc, 15)}btc or ${padEnd(stage.balance.fiat, 15)}$ }\r`)
    if (!bestStage || stage.balance.btc >= bestStage.balance.btc
      && stage.executedReinvestDays + stage.executedEarningDays <= bestStage.executedReinvestDays + bestStage.executedEarningDays) {
      bestStage = stage
    }
  })
  return bestStage
}

function padEnd(value, width, trunc = 11) {
  // let s = typeof value === 'number' ? value.toLocaleString('ru') : value.toString()
  let s = value.toLocaleString()
  return s.substr(0, trunc).padEnd(Math.max(width, s.length), ' ')
}