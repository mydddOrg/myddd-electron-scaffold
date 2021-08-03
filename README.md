# myddd electron模板
这是myddd在electron实现的模板项目。

electron是一个基于chrome内核的跨平台开发框架，基于它你可以使用前端技术开发出跨平台的桌面程序。这是它的最大优势之一。

myddd在electron和web上的实现基本一致，都是基于TypeScript + React实现了ddd领域驱动设计，但基于electron桌面开发，有几个显著的不同在于：

1. 引入sqlite并基于它实现了一个数据库框架

2. 引入了缓存框架与机制

3. 引入了日志机制

> 切记，不可把electron项目简单的理解成浏览器内核 + html这种实现，实现electron项目时，需要有桌面程序思维，也就是数据尽量下载并缓存到本地，有必要时再请求网络更新。html只是UI的一种实现载体。


详细文档 [稍后完善]





## electron国内源

electron本身的源在国外，如果使用国外源，yarn install时会非常慢。所以，在第一次yarn install之前，最好设置以下源，将其变更为国内源

~~~shell
#linux&mac
export ELECTRON_MIRROR='https://npm.taobao.org/mirrors/electron/'
export ELECTRON_BUILDER_BINARIES_MIRROR='http://npm.taobao.org/mirrors/electron-builder-binaries/'

#win
$env:ELECTRON_MIRROR='https://npm.taobao.org/mirrors/electron/'
$env:ELECTRON_BUILDER_BINARIES_MIRROR='http://npm.taobao.org/mirrors/electron-builder-binaries/'
~~~

## 