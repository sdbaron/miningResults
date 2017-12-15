class CryptoCurrencyRateBehavior {
  constructor(rate) {
    this.startRate = rate
  }

  getRate(day = 0) {
    throw new Error('not implemented')
  }

  convertToFiat(btc, day) {
    return btc / this.getRate(day)
  }

  convertToBtc(fiat, day) {
    return fiat * this.getRate(day)
  }

}

module.exports = CryptoCurrencyRateBehavior