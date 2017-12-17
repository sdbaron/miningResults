class Balance {
    constructor(parameters) {
        const params = Object.assign({ fiat: 0, btc: 0 }, parameters)
        this.converter = params.converter
        this.fiat = params.fiat || 0
        this.btc = params.btc || 0
    }
    
    changeFiat(addValue, day) {
        this.fiat += addValue
        this.btc = this.converter.convertToBtc(this.fiat, day)
    }
    
    changeBtc(addValue, day) {
        this.btc += addValue
        this.fiat = this.converter.convertToFiat(this.btc, day)
    }
    
    setConverter(converter) {
        this.converter = converter
    }
}

module.exports = Balance