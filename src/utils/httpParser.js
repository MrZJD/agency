const decodeGzip = require('./decodeGzip')

/**
 * @constant
 * @description => HTTP响应包的 行分割线
 */
const HTTP_LINE_SEP = Buffer.from('\r\n')

/**
 * @constant
 * @description => HTTP响应包的 header body分割线
 */
const HTTP_SEP = Buffer.from('\r\n\r\n')

/**
 * @function
 * @description headers buffer数据解码
 * @param {Buffer} rawHeaders
 */
function rawHeaders2Obj (rawHeaders) {
    return rawHeaders.toString().split('\r\n').reduce(((headers, kv) => {
        if (!kv.trim()) return headers
        const hVal = kv.trim().split(':')
        headers[hVal[0].trim()] = hVal[1].trim()
        return headers
    }), {})
}

/**
 * @function
 * @description 解析HTTP headers
 * @param {Buffer} data
 */
function parseHeader (data) {
    let p1 = data.indexOf(HTTP_LINE_SEP)
    let p2 = data.indexOf(HTTP_SEP)

    return rawHeaders2Obj(data.slice(p1 + 2, p2))
}

/**
 * @function
 * @description 解析HTTP body体
 * @param {Buffer} data 
 * @param {{}} headers
 * @param {string} encoding 
 */
function parseChunk (data, headers, encoding = 'buffer') {
    if (encoding !== 'buffer') {
        return Promise.resolve(data.toString(encoding))
    }
    
    let p = data.indexOf(HTTP_SEP) || 0

    /* 处理压缩编码 */
    const cEncoding = headers['Content-Encoding'] || headers['content-encoding']
    if (cEncoding === 'gzip') {
        return decodeGzip(data.slice(p + 4))
    }

    return Promise.resolve(data.toString())
}

module.exports = {
    parseHeader,
    parseChunk
}