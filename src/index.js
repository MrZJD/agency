#!/usr/bin/env node
const { appendFileSync, unlinkSync } = require('fs')
const { resolve } = require('path')
const httpProxy = require('./http')

const PROCESS_FILE = resolve(__dirname, '../.output')

httpProxy.run()

// process.on('beforeExit', exit)
// process.on('SIGINT', function () {
//     process.exit()
// })

process.on('uncaughtException', (err) => {
    // try {
    //     appendFileSync(PROCESS_FILE, err.stack)
    // } catch (e) {}

    // process.exit()
})
