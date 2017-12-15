const ImmediatelyReinvestStrategy = require('./InvestStrategy/immediatelyReinvestStrategy')
const NoReinvestStrategy = require('./InvestStrategy/noReinvestStrategy')
const ConstantPerfomance = require('./PerfomanceBehavior/constant')
const ConstCryptoCurrencyRateBehavior = require('./CryptoCurrencyRateBehavior/constant')
const Farm = require('./farm')

// стоимость ресурса в вычислительной мощностью 1GH/sec
const BIT_BTC_PRICE = 0.000008430
// стоимость ресурса в вычислительной мощностью 1GH/sec в долларах
const BIT_FIAT_PRICE =  1.5

const REINVEST_DATA = {
  // стоимость ресурса в вычислительной мощностью 1GH/sec
  bitBtcPrice: BIT_BTC_PRICE,
  // стоимость 10 GH/s - объём минимальной реинвестиции
  reinvestBtc: BIT_BTC_PRICE * 10,
  // стоимость ресурса в вычислительной мощностью 1GH/sec в долларах
  bitFiatPrice: BIT_FIAT_PRICE,
  // в долларах не инвестируем
  reinvestFiat: null,
}

const strategy = new ImmediatelyReinvestStrategy(REINVEST_DATA)
// 0.000000154 btc mining by 1 GH/s
const perfomanceBehavior = new ConstantPerfomance(0.000000154)
const currencyRateBehavior = new ConstCryptoCurrencyRateBehavior(1 / 16000)

const farm = new Farm({ power: 20000, maintenance: 0.15 }, strategy, perfomanceBehavior, currencyRateBehavior,
    (dayInfo) => {
      console.log(`${padEnd(dayInfo.day, 4)}: ${padEnd(dayInfo.power, 15)} ${padEnd(dayInfo.additionalPower || 0, 20, 10)} ${padEnd(dayInfo.balanceBtc, 20)} ${padEnd(dayInfo.balanceFiat, 20)} ${padEnd(dayInfo.reinvestBtc || 0, 20)} ${padEnd(dayInfo.reinvestFiat || 0, 20)}\r`)
    })
const earnBtcDays = 50

console.log(`${padEnd('day', 4)}: ${padEnd('power(GH/s)', 15)} ${padEnd('add Power(GH/s)', 20, 15)} ${padEnd('balance.btc', 20)} ${padEnd('balance.fiat', 20, 15)} ${padEnd('reinvestBtc', 20)} ${padEnd('reinvestFiat', 20, 16)}\r`)
farm.mine(365 - earnBtcDays)

const ernStrategy = new NoReinvestStrategy({ perfomance: strategy.perfomance })
farm.setStrategy(ernStrategy)
farm.setPerfomanceBehavior(perfomanceBehavior)
farm.mine(earnBtcDays)

const { btc, fiat } = farm.balance

function padEnd(value, width, trunc = 11) {
  // let s = typeof value === 'number' ? value.toLocaleString('ru') : value.toString()
  let s = value.toLocaleString('ru')
  return s.substr(0, trunc).padEnd(Math.max(width, s.length), ' ')
}