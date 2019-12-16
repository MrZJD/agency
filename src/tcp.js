const { createServer } = require('net')
const { getConf } = require('./utils/loadConfig')
const TCPProxyResponser = require('./class/TCPProxyResponser')
const { alog } = require('./logger')
const Conf = require('./class/Conf')

/* 处理tcp链接 */
function TCPHandler (conf, cltSocket) {
    new TCPProxyResponser(conf, cltSocket)
}

module.exports = {
    async run () {
        alog.info('loading proxy conf')
        const conf = new Conf(await getConf())
        alog.info('http proxy has started')

        const proxy = createServer(TCPHandler.bind(null, conf))

        proxy.listen(1337, '127.0.0.1')
        alog.info('http server already start: 127.0.0.1:1337')
    }
}