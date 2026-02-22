# EasyHotel 项目总结

## 项目概述

EasyHotel 是一个基于 NestJS 和 Taro 的易宿酒店预订系统，包含小程序端、PC 管理端和后端 API。项目实现了完整的酒店预订流程，包括酒店搜索、房型预订、订单管理、库存管理等功能。

## 技术栈

### 后端
- **NestJS** - Node.js 框架
- **TypeORM** - ORM 框架
- **PostgreSQL** - 数据库
- **Redis** - 消息队列和缓存
- **Bull** - 任务队列
- **JWT** - 身份认证
- **高德地图 API** - 地理位置服务

### 前端
- **Taro** - 小程序开发框架
- **React** - UI 框架
- **Ant Design** - PC 端 UI 组件库

---

## 已完成的功能

### 1. 消息队列系统（Bull + Redis）

#### 核心文件
- `api/src/queue/order-expiry.queue.ts` - 队列服务
- `api/src/queue/order-expiry.processor.ts` - 消费者处理器
- `api/src/queue/queue.module.ts` - 队列模块

#### 功能说明
- **自动取消过期订单**：订单创建后 60 秒内未支付，自动取消并释放库存
- **精确延迟**：使用 Bull 的延迟任务功能，精确到秒级
- **自动重试**：失败任务自动重试 3 次，使用指数退避策略
- **任务监控**：完整的日志记录，包括任务开始、完成、失败等事件

#### 工作流程
1. 用户提交订单 → 订单状态：PENDING
2. 创建延迟任务（60秒后执行）
3. 用户支付成功 → 取消延迟任务，订单状态：PAID
4. 60秒后未支付 → 自动取消订单，释放库存

---

### 2. Docker 配置

#### 文件
- `docker-compose.yml` - Docker Compose 配置文件

#### 服务
- **Redis** - 端口 6379，用于消息队列
- **PostgreSQL** - 端口 5432，用于数据存储

#### 特性
- 数据持久化（Docker volumes）
- 健康检查（healthcheck）
- 自动重启（restart: unless-stopped）

---

### 3. 小程序首页功能

#### 核心文件
- `min/src/pages/index/index.tsx` - 首页组件
- `min/src/pages/index/index.scss` - 首页样式
- `min/src/services/hotel.service.ts` - 酒店服务

#### 功能说明

##### 3.1 轮播图展示
- 展示酒店宣传图片
- 自动轮播切换
- 点击跳转到酒店详情页

##### 3.2 推荐酒店
- 随机推荐酒店列表
- 展示酒店图片、名称、星级、价格
- 点击跳转到酒店详情页

##### 3.3 酒店搜索

**搜索表单包含：**
- 城市选择（下拉框）
- 酒店名称输入
- 入住/退房日期选择
- 价格范围选择
- 星级选择
- 标签选择

**价格选择弹窗：**
- 点击价格选项弹出弹窗
- 输入最低价格和最高价格
- 输入框并排显示，高度88px，文字居中
- 点击"确定"应用价格筛选
- 点击"取消"关闭弹窗

**星级选择弹窗：**
- 点击星级选项弹出弹窗
- 显示5颗星星
- 点击星星选中星级（选中星星高亮显示为黄色）
- 点击"确定"应用星级筛选
- 点击"取消"关闭弹窗

##### 3.4 定位功能

**定位按钮：**
- 城市选项框右侧显示地球图标 🌍
- 按钮大小：40px × 40px
- 图标大小：24px
- 点击触发定位

**定位流程：**
1. 检查用户定位权限
2. 如果未授权，弹出授权请求
3. 如果之前拒绝过，引导到设置页面
4. 获取用户经纬度坐标
5. 调用后端定位接口
6. 后端调用高德地图逆地理编码API
7. 返回省、市、区信息
8. 更新城市选项框为定位到的城市

**定位气泡：**
- 定位成功后显示气泡
- 气泡位置：地球图标上方
- 气泡样式：深灰色背景，圆角16px，带阴影
- 气泡尖角：向下指向地球图标
- 显示内容："已定位到x省，x市，x区"（直辖市显示"已定位到x市，x区"）
- 停留时间：30秒后自动消失
- 淡入动画效果

**城市拼音转换：**
- 定位到的城市名自动转换为拼音
- 用于数据库查询（如：上海 → shanghai）
- 支持北京、上海、广州、深圳、杭州、成都等城市

##### 3.5 待支付订单提醒
- 检测用户有待支付订单
- 显示倒计时（60秒）
- 点击跳转到订单详情页

##### 3.6 布局设计
- 城市选项框和酒店名称输入框在同一行
- 城市选项框占一行80%，定位按钮占20%
- 价格和星级选项在同一行
- 所有输入框高度统一为88px
- 文字居中对齐

---

### 4. 酒店列表页

#### 核心文件
- `min/src/pages/hotel/list.tsx` - 酒店列表组件
- `min/src/pages/hotel/list.scss` - 酒店列表样式

#### 功能说明
- 展示符合条件的酒店列表
- 支持分页加载
- 显示酒店图片、名称、星级、价格、地址
- 点击跳转到酒店详情页
- 日期选择器（入住/退房日期）
- 日期同步到详情页

---

### 5. 酒店详情页

#### 核心文件
- `min/src/pages/hotel/detail.tsx` - 酒店详情组件
- `min/src/pages/hotel/index.scss` - 酒店详情样式

#### 功能说明
- 展示酒店详细信息（图片、名称、星级、地址、设施）
- 展示房型列表（房型图片、名称、价格、库存）
- 日期选择器（入住/退房日期）
- 点击"预订"跳转到预订页
- 设施图标展示（WiFi、停车场、泳池、健身房等）
- 日期继承自列表页

---

### 6. 预订页

#### 核心文件
- `min/src/pages/book/book.tsx` - 预订组件
- `min/src/pages/book/book.scss` - 预订样式

#### 功能说明
- 展示预订信息（酒店、房型、日期）
- 确认预订信息
- 提交订单
- 订单创建后60秒内未支付自动取消

---

### 7. 订单管理

#### 核心文件
- `min/src/pages/order/detail.tsx` - 订单详情组件
- `api/src/order/order.service.ts` - 订单服务

#### 功能说明
- 展示订单列表
- 展示订单详情
- 订单状态：PENDING（待支付）、PAID（已支付）、CANCELLED（已取消）
- 待支付订单显示倒计时
- 支付成功后订单状态更新为PAID
- 超时未支付订单自动取消

---

### 8. 用户认证

#### 核心文件
- `min/src/pages/login/login.tsx` - 登录组件
- `min/src/pages/register/register.tsx` - 注册组件
- `api/src/user/user.service.ts` - 用户服务

#### 功能说明
- 用户登录（手机号+密码）
- 用户注册（手机号+密码）
- JWT token 认证
- 受保护路由需要登录

---

### 9. 商户管理端

#### 核心文件
- `pc/src/pages/` - PC 端页面
- `api/src/hotel/` - 酒店管理
- `api/src/room-type/` - 房型管理
- `api/src/room-price-calendar/` - 价格日历管理
- `api/src/inventory/` - 库存管理

#### 功能说明
- 新增酒店（添加、图片上传下载、提交审核）
- 酒店管理（添加、图片上传下载、编辑、删除）
- 房型管理（添加、编辑、删除）
- 价格管理（设置房型价格）
- 库存管理（设置房型库存）
- 订单管理（查看、处理订单）
- 审核管理（审核酒店提交）

---

### 10. 定位服务（高德地图 API）

#### 核心文件
- `api/src/hotel/hotel.controller.ts` - 定位接口
- `min/src/pages/index/index.tsx` - 定位调用

#### 功能说明
- **接口路径**：`GET /mini/hotel/location`
- **参数**：
  - `location`：经纬度（格式：经度,纬度）
  - `key`：高德地图API Key
- **返回**：高德地图逆地理编码结果
- **无需认证**：使用 `@Public()` 装饰器

**返回数据结构：**
```json
{
  "code": 200,
  "data": {
    "status": "1",
    "regeocode": {
      "addressComponent": {
        "province": "上海市",
        "city": [],
        "district": "闵行区",
        "township": "..."
      },
      "formatted_address": "..."
    }
  }
}
```

**城市拼音映射：**
- 北京 → beijing
- 上海 → shanghai
- 广州 → guangzhou
- 深圳 → shenzhen
- 杭州 → hangzhou
- 成都 → chengdu

---

## 如何使用

### 开发环境

#### 1. 启动 Docker 服务
```bash
docker-compose up -d
```

#### 2. 配置环境变量
```bash
cd api
copy .env.example .env
```

#### 3. 安装依赖
```bash
npm install
```

#### 4. 启动后端服务
```bash
npm run start:dev
```

#### 5. 启动小程序
```bash
cd ../min
npm install
npm run dev:weapp
```

#### 6. 启动 PC 管理端
```bash
cd ../pc
npm install
npm start
```

### 使用启动脚本（Windows）

双击 `start.bat` 文件，自动完成以下操作：
1. 检查 Docker 服务
2. 启动 Docker 容器
3. 创建 .env 文件（如果不存在）
4. 启动后端 API 服务

---

## GitHub 上传指南

### 1. 初始化 Git 仓库（如果还没有）
```bash
git init
```

### 2. 添加所有文件
```bash
git add .
```

### 3. 提交更改
```bash
git commit -m "feat: 添加消息队列系统和 Docker 配置"
```

### 4. 关联远程仓库
```bash
git remote add origin https://github.com/your-username/EasyHotel.git
```

### 5. 推送到 GitHub
```bash
git push -u origin main
```

### 注意事项
- ✅ 已配置 `.gitignore`，不会上传敏感文件
- ✅ 已配置 `api/.dockerignore`，优化 Docker 构建
- ✅ `.env` 文件不会上传（在 `.gitignore` 中）
- ✅ `node_modules` 不会上传
- ✅ `dist` 和 `build` 目录不会上传

---

## 环境变量配置

### 必须配置的变量

在 `api/.env` 文件中配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=easyhotel
DB_PASSWORD=easyhotel123
DB_DATABASE=easyhotel

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 应用配置
PORT=3000
NODE_ENV=development

# 锁单时间（毫秒）
ORDER_LOCK_TIME=60000

# 高德地图 API Key
AMAP_KEY=your-amap-api-key
```

---

## 核心功能测试

### 1. 测试自动取消过期订单

#### 步骤
1. 创建一个订单（状态：PENDING）
2. 等待 60 秒
3. 检查订单状态（应该变为 CANCELLED）
4. 检查库存（应该已释放）

#### 验证方法
- 查看后端日志，应该看到 "=== 开始处理过期订单 ==="
- 查看数据库，订单状态应该为 CANCELLED
- 查看库存表，holdQty 应该减少

### 2. 测试支付后取消延迟任务

#### 步骤
1. 创建一个订单（状态：PENDING）
2. 在 60 秒内完成支付
3. 检查订单状态（应该变为 PAID）
4. 等待 60 秒
5. 检查订单状态（应该保持 PAID）

#### 验证方法
- 查看后端日志，应该看到支付成功的日志
- 查看数据库，订单状态应该为 PAID
- 延迟任务应该被取消

### 3. 测试定位功能

#### 步骤
1. 打开小程序首页
2. 点击地球图标 🌍
3. 允许定位权限
4. 等待定位完成
5. 检查城市选项框是否更新为定位到的城市
6. 检查是否显示定位气泡

#### 验证方法
- 查看控制台日志，应该看到定位流程的调试信息
- 查看定位气泡，应该显示"已定位到x省，x市，x区"
- 查看城市选项框，应该更新为定位到的城市

---

## 监控和调试

### 查看队列状态

#### 方法 1：使用 Bull Board（推荐）
```bash
# 安装 Bull Board
npm install -g @bull-board/api

# 启动监控界面
bull-board --port 3001 --redis-host localhost --redis-port 6379
```

访问 `http://localhost:3001` 查看队列状态。

#### 方法 2：使用 Redis CLI
```bash
# 连接 Redis
redis-cli

# 查看所有键
KEYS bull:*

# 查看队列长度
LLEN bull:order-expiry:waiting

# 查看延迟任务
ZRANGE bull:order-expiry:delayed 0 -1
```

### 查看日志

#### 后端日志
```bash
# 查看实时日志
npm run start:dev

# 查看队列处理日志
# 日志包含：
# - 任务开始
# - 任务完成
# - 任务失败
# - 任务停滞
```

#### Docker 日志
```bash
# 查看 Redis 日志
docker-compose logs -f redis

# 查看 PostgreSQL 日志
docker-compose logs -f postgres
```

---

## 常见问题

### 1. Redis 连接失败

#### 错误信息
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

#### 解决方法
```bash
# 检查 Redis 是否运行
docker-compose ps redis

# 启动 Redis
docker-compose up -d redis

# 测试连接
redis-cli ping
# 应该返回 PONG
```

### 2. 队列任务不执行

#### 可能原因
- Redis 连接失败
- QueueModule 未正确导入
- 消费者处理器未正确注册

#### 解决方法
1. 检查 Redis 连接
2. 检查 `queue.module.ts` 是否正确导入
3. 检查 `order-expiry.processor.ts` 是否正确注册
4. 查看后端日志，确认消费者是否启动

### 3. 订单未自动取消

#### 可能原因
- 延迟任务未添加
- 消费者未运行
- 订单状态已变更

#### 解决方法
1. 检查订单创建时是否添加了延迟任务
2. 检查消费者是否运行
3. 查看后端日志，确认任务是否执行
4. 检查订单状态是否为 PENDING

### 4. 定位功能失败

#### 可能原因
- 未配置定位权限
- 用户拒绝定位权限
- 高德地图 API Key 无效

#### 解决方法
1. 检查 `app.config.ts` 是否配置了 `requiredPrivateInfos` 和 `permission`
2. 检查高德地图 API Key 是否有效
3. 检查后端定位接口是否正常运行
4. 查看控制台日志，确认定位流程

---

## 性能优化建议

### 1. Redis 配置优化

#### 开发环境
- 使用默认配置即可

#### 生产环境
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### 2. 队列配置优化

#### 开发环境
```typescript
// queue.module.ts
defaultJobOptions: {
  removeOnComplete: 10,
  removeOnFail: 10,
}
```

#### 生产环境
```typescript
// queue.module.ts
defaultJobOptions: {
  removeOnComplete: {
    age: 3600,
    count: 100,
  },
  removeOnFail: {
    age: 3600,
    count: 100,
  },
}
```

### 3. 并发控制

```typescript
// order-expiry.processor.ts
@Processor('order-expiry')
export class OrderExpiryProcessor {
  @Process('cancel-expired-order')
  @QueueOptions({ concurrency: 5 })
  async handleExpiredOrder(job: Job) {
    // 处理逻辑
  }
}
```

---

## 下一步计划

### 短期
- [ ] 添加 Bull Board 监控界面
- [ ] 完善单元测试
- [ ] 添加性能监控
- [ ] 优化定位功能（支持IP定位）

### 中期
- [ ] 实现订单状态变更通知
- [ ] 添加订单统计报表
- [ ] 优化队列性能
- [ ] 添加收藏功能

### 长期
- [ ] 实现分布式队列
- [ ] 添加消息队列集群
- [ ] 实现高可用架构
- [ ] 添加支付功能集成

---

## 总结

### 已完成
✅ 消息队列系统（Bull + Redis）
✅ 自动取消过期订单功能
✅ Docker 配置（Redis + PostgreSQL）
✅ 完整的项目文档
✅ GitHub 上传准备
✅ 小程序首页（轮播图、推荐酒店、搜索、定位）
✅ 酒店列表页
✅ 酒店详情页
✅ 预订功能
✅ 订单管理
✅ 用户认证
✅ 商户管理端
✅ 定位功能（高德地图 API）

### 技术亮点
✅ 精确的延迟任务（60秒）
✅ 自动重试机制（3次）
✅ 完整的日志记录
✅ 数据持久化
✅ 健康检查
✅ 自动重启
✅ 响应式设计
✅ 优雅的 UI 交互
✅ 地理位置服务集成

### 可行性
✅ Windows Docker Desktop 完全支持
✅ 开发环境资源消耗极小
✅ 可以上传到 GitHub
✅ Docker 配置可以一起上传
✅ 适合小项目使用
✅ 完整的酒店预订流程

### 适用场景
✅ 小型酒店预订系统
✅ 学习消息队列概念
✅ 快速原型开发
✅ 个人项目
✅ 商户管理平台

---

## 联系方式

如有问题，请提交 Issue 或 Pull Request。
