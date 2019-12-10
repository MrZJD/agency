/**
 * @file
 * @description 加载代理配置
 */
const glob = require('glob')
const path = require('path')

function getConf () {
    let conf = null

    return function () {
        if (conf) return Promise.resolve(conf)

        return new Promise((resolve, reject) => {
            return glob(path.resolve(__dirname, '../../config/*.json'), function (err, result) {
                if (err) {
                    reject(err)
                    return
                }

                conf = result.reduce((target, cj) => {
                    return {
                        ...target,
                        ...require(cj)
                    }
                }, {})
    
                resolve(conf)
            })
        })
    }
}

module.exports = {
    getConf: getConf()
}
