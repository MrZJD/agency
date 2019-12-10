const { createServer, request } = require('http')
const { connect } = require('net')
const { URL } = require('url')
const { getConf } = require('./utils/loadConfig')
const { response } = require('./utils/transfomers')
const { iMsg2httpRaw } = require('./utils/formater')
const pipeChain = require('./utils/pipeChain')
const { alog, elog } = require('./logger')

module.exports = {
    async run () {
        alog.info('loading proxy conf')
        const conf = await getConf()
        alog.info('http proxy has started')
        /* 处理http链接 */
        async function handler (req, res) {
            let { hostname, port } = new URL(req.url)
            const reqSocket = req.socket
            const resSocket = res.socket

            if (conf[hostname]) {
                const target = conf[hostname].split(':')
                hostname = target[0]
                port = target[1]
            }
        
            /* 向目标服务器申请一个连接请求 */
            const srvSocket = connect(port || 80, hostname, () => {
                alog.info(`success: ${req.url}`)
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
                elog.error(`fail: ${req.url}\r\n${err.stack}`)

                resSocket.end('HTTP/1.1 408 Request Timeout\r\n')
            })
        }
        const proxy = createServer(handler)

        proxy.listen(1337, '127.0.0.1')
        alog.info('http server already start: 127.0.0.1:1337')
    }
}
