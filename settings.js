// стоимость ресурса в вычислительной мощностью 1GH/sec
const BIT_BTC_PRICE = 0.000008430
// стоимость ресурса в вычислительной мощностью 1GH/sec в долларах
const BIT_FIAT_PRICE = 0.15

exports.REINVEST_BTC_DATA = {
  // стоимость ресурса в вычислительной мощностью 1GH/sec
  bitBtcPrice: BIT_BTC_PRICE,
  // стоимость 10 GH/s - объём минимальной реинвестиции
  reinvestBtc: BIT_BTC_PRICE * 10,
  // стоимость ресурса в вычислительной мощностью 1GH/sec в долларах
  bitFiatPrice: BIT_FIAT_PRICE * 10,
  // в долларах не инвестируем
  reinvestFiat: null,
}

exports.BIT_BTC_PRICE = BIT_BTC_PRICE
exports.BIT_FIAT_PRICE = BIT_FIAT_PRICE

exports.padEnd = function(value, width, trunc = 11) {
  let s = value.toLocaleString()
  return s.substr(0, trunc).padEnd(Math.max(width, s.length), ' ')
}