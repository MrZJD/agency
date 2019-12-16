/**
 * @file
 * @description 代理配置表
 * 
 * 文件名规范 [env].[module].[js|json]
 * 
 * 表键值规范
 * key: @type {string} 正则表达式字符串
 * value: @type {string} 目标节点
 * 
 * 目标节点可以为文件 或者 目录 或者主机名及端口
 * 非文件时 会把path拼凑进目标节点路径后 
 */
module.exports = {
    "http://file.mrzjd.cn": "file://E:/laboratory/repo/agency/html/",
    "http://proxy.mrzjd.cn": "127.0.0.1:9998",
    "https://proxy.mrzjd.cn": "127.0.0.1:9997",
}
