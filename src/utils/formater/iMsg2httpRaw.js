
/**
 * @function
 * @description 将rawHeaders转为字符串
 * @param {[string]} rawHeaders
 */
function getRawHeaders (rawHeaders) {
    return rawHeaders.reduce((h, val, ind) => {
        return h + val + (ind % 2 === 0 ? ':' : '\r\n')
    }, '')
}

/**
 * @function
 * @description IncommingMessage to HttpRaw
 * @param {import('http').IncomingMessage} request
 */
function iMsg2httpRaw (request) {
    const { method, url} = request

    /* [http status line]\r\n[headers]\r\n\r\n */
    return `${method.toUpperCase()} ${url} HTTP/1.1\r\n${getRawHeaders(request.rawHeaders)}\r\n\r\n`
}

module.exports = iMsg2httpRaw