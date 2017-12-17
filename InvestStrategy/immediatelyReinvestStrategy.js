const Strategy = require('./base')

class ImmediatelyReinvestStrategy extends Strategy {
  constructor(params) {
    super(params)
  }

  howMatchReinvest(day, btcSum, converter) {
    let fiatSum
    let spentFiat = 0
    let spentBtc = 0
    let additionalPower = 0
    if (this.minValueBtcForReinvest && btcSum > this.minValueBtcForReinvest){
      spentBtc = (btcSum / this.minValueBtcForReinvest ^ 0) * this.minValueBtcForReinvest
      additionalPower = spentBtc / this.bitBtcPrice
    } else if (this.reinvestFiat && (fiatSum = converter.convertToFiat(btcSum, day)) > this.reinvestFiat){
      spentFiat = (fiatSum / this.reinvestFiat ^ 0) * this.reinvestFiat
      additionalPower = spentFiat / this.bitFiatPrice
    }
    return {
      spentBtc,
      spentFiat,
      additionalPower: additionalPower,
      investedBtc: 0,
      investedFiat: 0
    }
  }
  
}

module.exports = ImmediatelyReinvestStrategy