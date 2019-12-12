const { createServer } = require('http')
const { getConf } = require('./utils/loadConfig')
const ProxyResponser = require('./class/ProxyResponer')
const { alog } = require('./logger')
const Conf = require('./class/Conf')

/* 处理http链接 */
function HTTPHandler (conf, req, res) {
    let proxyTarget = conf.handle(req.url)

    new ProxyResponser(proxyTarget).resolve(req, res)
}

module.exports = {
    async run () {
        alog.info('loading proxy conf')
        const conf = new Conf(await getConf())
        alog.info('http proxy has started')

        const proxy = createServer(HTTPHandler.bind(null, conf))

        proxy.listen(1337, '127.0.0.1')
        alog.info('http server already start: 127.0.0.1:1337')
    }
}
