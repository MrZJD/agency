const log4js = require('log4js')
const path = require('path')

const conf = {
    // 输出目标
    appenders: {
        access: {
            type: 'file',
            filename: path.resolve(__dirname, '../../logs/access.log')
        },
        error: {
            type: 'file',
            filename: path.resolve(__dirname, '../../logs/error.log')
        }
    },
    // 分类
    categories: {
        access: {
            appenders: ['access'],
            level: 'all'
        },
        error: {
            appenders: ['error'],
            level: 'warn'
        },
        default: {
            appenders: ['access'],
            level: 'all'
        }
    }
}

log4js.configure(conf)

module.exports = {
    // 分模块 功能等级
    alog: log4js.getLogger('access'),
    elog: log4js.getLogger('error')
}
