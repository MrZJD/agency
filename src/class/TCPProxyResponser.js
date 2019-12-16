const { createConnection } = require('net')
const { URL } = require('url')
const { access, createReadStream } = require('fs')
const path = require('path')
const { iMsg2httpRaw } = require('../utils/formater')
const { response, debug } = require('../utils/transfomers')
const pipeChain = require('../utils/pipeChain')
const { alog, elog } = require('../logger')

const MODE_DIRECT = 'MODE_DIRECT'
const MODE_PROXY = 'MODE_PROXY'
const MODE_FILE = 'MODE_FILE'

const FILE_RE = /^file:\/\//
const FILE_NOT_FOUND = path.resolve(__dirname, '../../html/404.html')

/**
 * @class ProxyResponser
 * @description 代理响应器
 */
class TCPProxyResponser {
    /**
     * @constructor
     * @param {Object} conf 代理配置
     * @param {import('net').Socket} cltSocket 请求socket
     */
    constructor (conf, cltSocket) {
        this.conf = conf
        this.target = null
        this.cltSocket = cltSocket

        this.established = false
        this.rawStatus = ''
        this.status = {
            method: null,
            url: -1,
            protocol: ''
        }

        this.mode = ''

        this.handleCltSocket()
    }

    /**
     * @method handleCltSocket
     * @description 处理客户端连接请求
     */
    handleCltSocket () {
        this.established = false

        this.cltSocket.on('data', (chunk) => {
            if (this.established) {
                this.trigger(chunk)
                return
            }

            this.formatStatusLine(chunk)

            this.resolve(chunk)

            this.established = true
        })

        // this.cltSocket.on('close', () => {
        //     console.log('client connection close')
        // })
    }

    /**
     * @method requestSrv
     * @description 转发请求
     * @return {Promise<import('net').Socket>}
     */
    requestSrv (url) {
        let hostname
        let port

        if (this.isHttps) {
            [hostname, port] = url.split(':')
            port = port || 443
        } else {
            const purl = new URL(url)
            hostname = purl.hostname
            port = purl.port || 80
        }

        return new Promise((resolve, reject) => {
            const srvSocket = createConnection(port, hostname, () => {
                alog.info(`success: ${url}`)

                resolve(srvSocket)
            })

            srvSocket.on('error', (err) => {
                elog.error(`fail: ${url}\r\n${err.stack}`)
    
                this.cltSocket.end('HTTP/1.1 500 agency.node.js Failed\r\n')
            })
        })
    }

    /**
     * @method handleSrv
     * @description 处理转发的请求
     * @param {import('net').Socket} srvSocket
     * @param {import('buffer').Buffer} chunk
     */
    handleSrv (srvSocket, chunk) {
        this.srvSocket = srvSocket

        if (this.isHttps) {
            // https pre request establish
            this.cltSocket.write(Buffer.from('HTTP/1.1 200 Connection established\r\nProxy-Agent: agency.node.js\r\n\r\n'))
        } else {
            // http
            this.srvSocket.write(chunk)
        }

        // pipe: client 响应 <= 目标服务
        // srvSocket => ResTransfomer => resSocket
        pipeChain(
            srvSocket,
            // debug('DEBUG: request: srv->clt:', true),
            // response(),
            this.cltSocket
        )
    }

    trigger (chunk) {
        this.srvSocket.write(chunk)
    }

    /**
     * @method formatStatusLine
     * @description 格式化 http 状态行
     * @param {Buffer} firstChunk 
     */
    formatStatusLine (firstChunk) {
        let i = Buffer.from('\r\n')
        let lineI = firstChunk.indexOf(i)

        const status = firstChunk.slice(0, lineI).toString().split(' ')

        this.rawStatus = status
        this.status.method = status[0]
        this.status.url = status[1]
        this.status.protocol = status[2]

        this.isHttps = status[0].toLowerCase() === 'connect'
    }

    /**
     * @method
     * @description 文件模式
     * @param {import('http').IncomingMessage} req 
     * @param {import('http').ServerResponse} res 
     */
    file (req, res) {
        res.writeHead(200, 'ok', {
            'Content-Type': 'text/html'
        })

        let fileRoot = this.target.replace(FILE_RE, '')
        let filePath = new URL(req.url).pathname

        let fileUri = path.resolve(fileRoot, filePath === '/' ? './index.html' : ('./' + filePath))

        access(fileUri, function (err) {
            if (err) {
                // 文件不存在
                alog.info(`[file] 404 not found ${fileUri}`)
                fileUri = FILE_NOT_FOUND
            } else {
                alog.info(`[file] 200 ok ${fileUri}`)
            }

            // 文件存在
            let srvStream = createReadStream(fileUri)

            srvStream.on('data', function (chunk) {
                res.write(chunk)
            })

            srvStream.on('end', function () {
                res.end()
            })
        })
    }

    /**
     * @method
     * @description 代理服务器模式
     */
    proxy () {
        let url = this.status.url

        alog.info(`[direct] ${url}`)

        this.requestSrv('http://' + this.target)
            .then((s) => this.handleSrv(s, chunk))
    }

    /**
     * @method
     * @description 直连模式
     */
    direct (chunk) {
        let url = this.status.url

        alog.info(`[direct] ${url}`)

        this.requestSrv(url)
            .then((s) => this.handleSrv(s, chunk))
    }

    resolveMode () {
        this.target = this.conf.handle(this.status.url)

        if (!this.target) {
            this.mode = MODE_DIRECT
            return
        }
        if (FILE_RE.test(this.target)) {
            this.mode = MODE_FILE
            return
        }
        this.mode = MODE_PROXY
    }

    resolve(chunk) {
        this.resolveMode()

        switch (this.mode) {
            case MODE_DIRECT: this.direct(chunk); break;
            case MODE_PROXY: this.proxy(chunk); break;
            case MODE_FILE: this.file(); break;
        }
    }
}

module.exports = TCPProxyResponser
