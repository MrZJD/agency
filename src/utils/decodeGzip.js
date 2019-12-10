const { gunzip } = require('zlib')

/**
 * @function
 * @description gzip解码
 * @param {Buffer} buf 
 * @returns {Promise<string>}
 */
function decodeGzip (buf) {
    return new Promise((resolve, reject) => {
        const L_SEP = Buffer.from('\r\n')
        const li = buf.indexOf(L_SEP)
        const chunklen = parseInt(buf.slice(0, li).toString(), 16)
        const ci = li + L_SEP.length

        gunzip(buf.slice(ci, ci + chunklen), function (err, result) {
            if (err) {
                reject(err)
                return
            }
            resolve(result.toString())
        })
    })
}

module.exports = decodeGzip