const Strategy = require('./base')

class noReinvestStrategy extends Strategy {
  constructor(params) {
    super(params)
  }

  howMatchReinvest(day, btcSum) {
    return {
      spentBtc: 0,
      spentFiat: 0,
      additionalPower: 0,
      investedBtc: 0,
      investedFiat: 0
    }
  }
}

module.exports = noReinvestStrategy