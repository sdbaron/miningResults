class Strategy {
  constructor(params) {
    const prms = Object.assign(
        {
          reinvestBtc: 0.00008430,
          reinvestFiat: null,
          // стоимость ресурса в вычислительной мощностью 1GH/sec
          bitBtcPrice: 0.000008430,
          // стоимость ресурса в вычислительной мощностью 1GH/sec в долларах
          bitFiatPrice: 1.5,
        },
        params
    )

    this.perfomance = prms.perfomance
    this.reinvestBtc = prms.reinvestBtc
    this.reinvestFiat = prms.reinvestFiat
    this.bitBtcPrice = prms.bitBtcPrice
    this.bitFiatPrice = prms.bitFiatPrice
  }

  getInfoForDay(day) {
    return {
      howMachReinvest: this.howMatchReinvest.bind(this)
    }
  }

  howMatchReinvest(day, sum) {
    throw new Error('not inplemented')
  }

}

module.exports = Strategy