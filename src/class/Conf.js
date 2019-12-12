/**
 * @class
 * @description 代理配置处理器
 */
class Conf {
    /**
     * @constructor
     * @param {Object} conf 代理配置表
     */
    constructor (conf) {
        this.conf = conf
    }

    /**
     * @method handle
     * @description 查询目标url是否使用代理
     * @param {string} reqUrl
     */
    handle (reqUrl) {
        for (let re in this.conf) {
            // 能匹配上
            if (new RegExp(re).test(reqUrl)) {
                return this.conf[re]
            }
        }

        // 没有任何匹配
        return null
    }
}

module.exports = Conf
