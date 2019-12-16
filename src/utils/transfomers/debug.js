const ProxyTransfomer = require('../../class/ProxyTransfomer')
const { red } = require('chalk')
const { parseHeader, parseChunk } = require('../httpParser')

/**
 * @function debugTransfomer
 * @description debug流转换器
 */
module.exports = (flag = red('DEBUG: ')) => new ProxyTransfomer(null, function () {
    let headers = null

    return function (data, encoding) {
        console.log('DEBUG: ')

        // if (!headers) {
        //     headers = parseHeader(data)
        // }

        // parseChunk(data, headers, encoding).then((content) => {
        //     console.log(flag)
        //     console.log(content)
        // })

        // console.log(flag + '=====')

        return data
    }
}())
