const CryptoCurrencyRateBehavior = require('./base')

class ConstCryptoCurrencyRateBehavior extends CryptoCurrencyRateBehavior {
  constructor(rate) {
    super(rate)
  }

  getRate(day = 0) {
    return this.startRate
  }
}

module.exports = ConstCryptoCurrencyRateBehavior