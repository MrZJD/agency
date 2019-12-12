const { resolve } = require('path')
const { readFileSync, unlinkSync } = require('fs')

const isMain = require.main === module
const PID_FILE = resolve(__dirname, '../../.pid')

function main () {
    let PID

    try {
        PID = readFileSync(PID_FILE)
    } catch (err) {
        isMain && console.log('未找到对应进程')
        return
    }

    const pid = parseInt(PID.toString().trim())

    if (!pid) {
        isMain && console.log('未找到对应进程')
        return
    }

    try {
        process.kill(pid, 'SIGINT')
    } catch (e) {
        console.log('error: ' + e.stack)
    }

    try {
        unlinkSync(PID_FILE)
    } catch (e) {
        console.log('error: ' + e.stack)
    }
}

if (isMain) {
    main()
} else {
    module.exports = main
}
