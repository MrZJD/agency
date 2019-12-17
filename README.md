## agency

> 代理服务: 解决hosts切换&nginx的部分代理功能不够灵活的问题

### Usage 开始使用

```md
1. 本机开启代理 `127.0.0.1:1337`
2. 启用agency服务 `npm start`
3. 关闭agency服务 `npm stop`
4. 重启agency服务 `npm run reload`
```

浏览器代理推荐使用 _ProxySwitchySharp_

### Proxy配置

在config目录下新建不同环境的配置文件

推荐规范 `[env].[server_name].json`

```js
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
```

### 说明

* file模式不支持https访问
