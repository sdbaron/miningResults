const MaxReinvestPlan = require('./maxReinvest')

/**
 * Выбирает лучшее сочетание времени на реинвестирование и времени на накопление
 * @param {object} reinvestInfo Данные о лимитах реинвестирования
 * @param {object} parameters
 * @param {number} parameters.miningDays - общее число дней майнинга
 * @param {number|null} parameters.fiatLimit - ограничение на прибыль. если значение задано,
 *  то не предпочитаем вариант, когда добываем указанную сумму за меньшее время
 * @param {object} parameters.perfomanceBehavior - поведение производительности во времени
 * @param {object} parameters.currencyRateBehavior - поведение курса BTC во времени
 * @param {object} parameters.farmInitData - характеристики фермы
 * @param {boolean} parameters.shouldCollectDayInfo
 * @returns {*} - возвращает информацию по лучшему варианту (время на реинвестирование, время на накопление, баланс)
 */
function checkReinvestPlan(reinvestInfo, parameters ) {
  const stages = []
  for (let maxReinvestDays = parameters.miningDays; maxReinvestDays >= 0; maxReinvestDays--) {
    let daysInfo = []
    const plan = new MaxReinvestPlan(Object.assign(
      {
        name: `MaxReinvest ${maxReinvestDays}`,
        reinvestInfo: reinvestInfo,
        miningDays: parameters.miningDays,
        maxReinvestDays: maxReinvestDays,
        perfomanceBehavior: parameters.perfomanceBehavior,
        currencyRateBehavior: parameters.currencyRateBehavior,
        fiatLimit: parameters.fiatLimit,
      },
      parameters.farmInitData,
      ),
      parameters.shouldCollectDayInfo === true ? (dayInfo) => daysInfo.push(dayInfo): null,
    )
    const stgs = plan.start()
    const stage = stgs[0]
    if (stage) {
      stage.daysInfo = daysInfo
      stages.push(stage)
    }
  }
  
  let bestStage = null
  stages.forEach(stage => {
    // console.log(`Stage: ${padEnd(stage.name, 25, 25)} invest days:${padEnd(stage.executedReinvestDays, 4)} earned days:${padEnd(stage.executedEarningDays, 15)} currentPower: ${padEnd(stage.power, 15)} GH/s Balance: { ${padEnd(stage.balance.btc, 15)}btc or ${padEnd(stage.balance.fiat, 15)}$ }\r`)
    if (!bestStage || stage.balance.btc >= bestStage.balance.btc
      && stage.executedReinvestDays + stage.executedEarningDays <= bestStage.executedReinvestDays + bestStage.executedEarningDays) {
      bestStage = stage
    }
  })
  return bestStage
}

module.exports = checkReinvestPlan