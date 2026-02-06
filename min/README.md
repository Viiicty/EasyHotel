# EasyHotel 微信小程序

基于 Taro + React 开发的移动端微信小程序。

## 技术栈

- Taro 3.6.23
- React 18
- TypeScript
- Sass

## 项目结构

```
min/
├── config/           # 配置文件
├── src/             # 源代码
│   ├── pages/       # 页面
│   │   ├── index/   # 首页
│   │   ├── hotel/   # 酒店相关
│   │   ├── order/   # 订单相关
│   │   └── user/    # 用户相关
│   ├── styles/      # 样式文件
│   ├── app.tsx      # 应用入口
│   ├── app.config.ts # 应用配置
│   └── app.scss     # 全局样式
├── package.json
├── tsconfig.json
└── project.config.json
```

## 安装依赖

```bash
npm install
```

## 开发

启动微信小程序开发模式：

```bash
npm run dev:weapp
```

## 构建

构建微信小程序生产版本：

```bash
npm run build:weapp
```

## 页面说明

- **首页**: 展示热门酒店、搜索功能
- **酒店列表**: 酒店列表、筛选功能
- **酒店详情**: 酒店详细信息、预订功能
- **订单列表**: 用户订单管理
- **个人中心**: 用户信息、菜单导航

## 注意事项

1. 首次运行需要安装依赖
2. 使用微信开发者工具打开 `dist` 目录
3. 在 `project.config.json` 中配置正确的 `appid`
