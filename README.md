# myddd electron模板
这是myddd在electron实现的模板项目。

electron是一个基于chrome内核的跨平台开发框架，基于它你可以使用前端技术开发出跨平台的桌面程序。这是它的最大优势之一。

myddd在electron和web上的实现基本一致，都是基于TypeScript + React实现，但基于electron桌面开发，有几个显著的不同在于：

1. 引入sqlite并基于它实现了一个数据库框架

2. 引入了缓存框架与机制

> 切记，不可把electron项目简单的理解成浏览器内核 + html这种实现，实现electron项目时，需要有桌面程序思维，也就是数据尽量下载并缓存到本地，有必要时再请求网络更新。html只是UI的一种实现载体。


详细文档 [稍后完善]