const { Transform } = require('stream')

class ProxyTransfomer extends Transform {
    constructor (options, filters) {
        super(options)

        this.filters = filters
    }

    _transform (data, encoding, callback) {
        this.push(this.filters(data, encoding))

        callback()
    }

    connect (input, output) {
        input.pipe(this)
        this.pipe(output)
    }
}

module.exports = ProxyTransfomer
