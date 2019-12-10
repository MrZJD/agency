const { spawn } = require('child_process')
const { resolve } = require('path')
const { writeFileSync, accessSync } = require('fs')

const PID_FILE = resolve(__dirname, '../../.pid')

function main () {
    let hasFile = true
    try {
        accessSync(PID_FILE)
    } catch (e) {
        hasFile = false
    }

    // 如果pid已存在
    if (hasFile) {
        console.log('代理服务已存在')
        return
    }

    /* 只能使用异步exec 同步会阻塞start进程 */
    const cp = spawn('node', [resolve(__dirname, '../index.js')], {
        cwd: process.cwd(),
        detached: true,
        windowsHide: true
    })

    const pid = cp.pid + ''
    
    console.log(`starting agency service: pid(${pid}) - ${process.pid}`)

    writeFileSync(PID_FILE, pid)

    // setTimeout(() => {
    //     console.log(cp.pid)
    //     process.exit()
    // }, 3000)
    process.exit()
}

if (require.main === module) {
    main()
} else {
    module.exports = main
}
