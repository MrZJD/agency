const { connect } = require('net')
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
class ProxyResponser {
    constructor (target) {
        this.target = target

        if (!this.target) {
            this.mode = MODE_DIRECT
            return this
        }

        // 文件模式
        if (FILE_RE.test(this.target)) {
            this.mode = MODE_FILE
            return this
        }

        this.mode = MODE_PROXY
    }

    connect ({url, hostname, port, req, res}) {
        const reqSocket = req.socket
        const resSocket = res.socket

        /* 向目标服务器申请一个连接请求 */
        const srvSocket = connect(port || 80, hostname, () => {
            alog.info(`success: ${url}`)
            // pipe: client 请求 => 目标服务
            srvSocket.write(
                iMsg2httpRaw(req)
            )
            pipeChain(
                reqSocket,
                // debug(red(`DEBUG: request: clt->srv: `)),
                srvSocket
            )

            // pipe: client 响应 <= 目标服务
            // srvSocket => ResTransfomer => resSocket
            pipeChain(
                srvSocket,
                response(),
                // debug(red(`DEBUG: request: src->clt: `), true),
                resSocket
            )
        })

        srvSocket.on('error', function (err) {
            elog.error(`fail: ${targrtUrl}\r\n${err.stack}`)

            resSocket.end('HTTP/1.1 408 Request Timeout\r\n')
        })
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
     * @param {import('http').IncomingMessage} req 
     * @param {import('http').ServerResponse} res 
     */
    proxy (req, res) {
        let { hostname, port } = new URL('http://' + this.target)

        alog.info(`[proxy]: ${req.url}`)

        this.connect({
            url: req.url,
            hostname,
            port,
            req,
            res
        })
    }

    /**
     * @method
     * @description 直连模式
     * @param {import('http').IncomingMessage} req 
     * @param {import('http').ServerResponse} res 
     */
    direct (req, res) {
        let { hostname, port } = new URL(req.url)

        alog.info(`[direct] ${req.url}`)

        this.connect({
            url: req.url,
            hostname,
            port,
            req,
            res
        })
    }

    resolve(...args) {
        switch (this.mode) {
            case MODE_DIRECT: this.direct(...args); break;
            case MODE_PROXY: this.proxy(...args); break;
            case MODE_FILE: this.file(...args); break;
        }
    }
}

module.exports = ProxyResponser
