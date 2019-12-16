#!/usr/bin/env node
const { appendFileSync } = require('fs')
const { resolve } = require('path')
const tcpProxy = require('./tcp')

const PROCESS_FILE = resolve(__dirname, '../.output')

tcpProxy.run()

// process.on('uncaughtException', (err) => {
//     try {
//         appendFileSync(PROCESS_FILE, err.stack)
//     } catch (e) {}

//     process.exit()
// })
