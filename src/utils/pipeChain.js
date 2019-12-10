/**
 * @function
 * @description pipe chain 流的链式调用
 * @param {...import('stream').Duplex} noders
 */

module.exports = function pipeChain(...noders) {
    return noders.reduce((node, next, ind) => {
        if (ind === 0) return next

        if (!next) return node

        return node.pipe(next)
    }, null)
}
