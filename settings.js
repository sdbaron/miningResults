// стоимость ресурса в вычислительной мощностью 1GH/sec
const BIT_BTC_PRICE = 0.000008430
// стоимость ресурса в вычислительной мощностью 1GH/sec в долларах
const BIT_FIAT_PRICE = 1.5

exports.REINVEST_BTC_DATA = {
  // стоимость ресурса в вычислительной мощностью 1GH/sec
  bitBtcPrice: BIT_BTC_PRICE,
  // стоимость 10 GH/s - объём минимальной реинвестиции
  reinvestBtc: BIT_BTC_PRICE * 10,
  // стоимость ресурса в вычислительной мощностью 1GH/sec в долларах
  bitFiatPrice: BIT_FIAT_PRICE,
  // в долларах не инвестируем
  reinvestFiat: null,
}
