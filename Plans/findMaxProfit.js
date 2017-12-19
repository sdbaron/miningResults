const checkReinvestPlan = require('./checkReinvestPlan')

function findMaxProfit(reinvestInfo, farmInitData, parameters) {
  const params = Object.assign({
    maxMiningDays: 350,
    fiatLimit: null,
    btcLimit: null,
    shouldCollectDayInfo: false,
    perfomanceBehavior: null,
    currencyRateBehavior: null
  }, parameters)
  
  const {fiatLimit, btcLimit} = params
  
  let bestStage = null
  const stages = []
  for (let miningDays = 20; miningDays < params.maxMiningDays; miningDays++) {
    const stage = checkReinvestPlan(reinvestInfo,
      {
        miningDays,
        fiatLimit: params.fiatLimit,
        perfomanceBehavior: params.perfomanceBehavior,
        currencyRateBehavior: params.currencyRateBehavior,
        farmInitData,
        shouldCollectDayInfo: params.shouldCollectDayInfo,
      })

    if (fiatLimit && stage.balance.fiat <= fiatLimit) continue
    if (btcLimit && stage.balance.btc <= btcLimit) continue
    stages.push(stage)
  }
  
  if (fiatLimit || btcLimit) {
    // отсортируем по времени - сначала самый быстрый вариант
    stages.sort((a, b) => (a.executedReinvestDays + a.executedEarningDays) - (b.executedReinvestDays + b.executedEarningDays))
  } else {
    // если ищем максимальную прибыль, то и сортируем по максимальной прибыли
    stages.sort((a, b) => b.balance.btc - a.balance.btc)
  }
  
  bestStage = stages[0]
  stages.some(stage => {
    if (!fiatLimit && !btcLimit && stage.balance.btc < bestStage.balance.btc) return bestStage
    if ((stage.executedReinvestDays + stage.executedEarningDays) <= (bestStage.executedReinvestDays + bestStage.executedEarningDays)) {
      return (bestStage = stage)
    }
  })
  
  return bestStage
}

module.exports = findMaxProfit