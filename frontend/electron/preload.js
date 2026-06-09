const { contextBridge } = require('electron')

// 필요한 경우 여기서 안전하게 Node API를 렌더러에 노출
contextBridge.exposeInMainWorld('jabis', {
  version: process.env.npm_package_version || '1.0.0',
})
