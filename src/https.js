const { createServer, request } = require('http')
const net = require('net')
const { URL } = require('url')

const proxy = createServer((req, res) => {
    const { port, hostname } = new URL(`http://nodejs.cn`)
    // const cltSocket = req.socket
    const cltSocket = res.socket
    const head = Object.keys(req.headers).filter((val) => {
        return val !== 'host'
    }).map((val) => {
        return `${val}: ${req.headers[val]}\r\n`
    }).join('')

    /* 向目标服务器申请一个连接请求 */
    const srvSocket = net.connect(port || 80, hostname, () => {
        // pipe: client 请求 => 目标服务
        srvSocket.write([
            'GET / HTTP/1.1',
            'Host: nodejs.cn:80',
            'Connection: close',
            head,
            '\r\n'
        ].join('\r\n'))
        srvSocket.pipe(cltSocket)

        // pipe: client 响应 <= 目标服务
        // -> 写入proxy信息
        cltSocket.write([
            'HTTP/1.1 200 Connection Established\r\n',
            'Proxy-Agent: Node.js-Proxy lumos\r\n',
        ].join(''))
        cltSocket.pipe(srvSocket)
    })
})

// 运行代理 main
proxy.listen(80, '127.0.0.1')
