const ProxyTransfomer = require('../../class/ProxyTransfomer')

/**
 * @constant
 * @description => 响应客户端的HTTP HEADERS (basic + proxy info)
 */
const HTTP_HEADER_PROXY_AGENT = Buffer.from('\r\nProxy-Agent: agency.node.js')

/**
 * @constant
 * @description => HTTP响应包的 header body分割线
 */
const HTTP_SEP = Buffer.from('\r\n\r\n')

/**
 * @function ResponseTransfomer
 * @description 响应流转换器
 */
module.exports = () => new ProxyTransfomer(null, function () {
    let lock = false

    return function (/** @type {Buffer | string} */data, encoding) {
        if (lock) return data

        lock = true

        const ci = data.indexOf(HTTP_SEP)
        const chunk = Buffer.concat([
            data.slice(0, ci),
            HTTP_HEADER_PROXY_AGENT,
            data.slice(ci)
        ])

        // decodeGzip(data.slice(ci + 4))

        return chunk
    }
}())
