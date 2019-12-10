## agency

> 代理服务: 解决hosts切换 & nginx的部分代理功能不够灵活的问题

### Usage 开始使用

```md
1. 本机开启代理 `127.0.0.1:1377`
2. 启用agency服务 `npm start`
3. 重启agency服务 `npm reload`
4. 关闭agency服务 `npm stop`
```

### Proxy配置

在config目录下新建不同环境的配置文件

推荐规范 `[env].[server_name].json`

_test.agency.json_
```json
{
    "agency.com": "127.0.0.1:9090"
}
```
