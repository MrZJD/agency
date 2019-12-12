#!/usr/bin/env node
const { appendFileSync } = require('fs')
const { resolve } = require('path')
const httpProxy = require('./http')

const PROCESS_FILE = resolve(__dirname, '../.output')

httpProxy.run()

process.on('uncaughtException', (err) => {
    try {
        appendFileSync(PROCESS_FILE, err.stack)
    } catch (e) {}

    process.exit()
})
