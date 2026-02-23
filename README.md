# EasyHotel

一个基于 NestJS 和 Taro 的易宿酒店预订系统，包含小程序端、PC 管理端和后端 API。

## 项目概述

EasyHotel 实现了完整的酒店预订流程，包括：
- 酒店搜索和浏览
- 房型预订
- 订单管理
- 库存管理
- 商户管理
- 地理位置服务

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

## 快速开始

### 前置要求

- Node.js >= 16
- Docker Desktop
- Git
- 微信开发者工具（小程序开发）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/EasyHotel.git
cd EasyHotel
```

### 2. 启动 Docker 服务

```bash
docker-compose up -d
```

这将启动以下服务：
- **Redis** - 端口 6379
- **PostgreSQL** - 端口 5432

### 3. 配置环境变量

```bash
cd api
cp .env.example .env
```

编辑 `.env` 文件，配置数据库和 Redis 连接：

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

### 4. 安装依赖

```bash
cd api
npm install
```

### 5. 启动后端服务

```bash
npm run start:dev
```

后端 API 将在 `http://localhost:3000` 运行。

### 6. 启动小程序

```bash
cd ../min
npm install
npm run dev:weapp
```

使用微信开发者工具打开 `min/dist` 目录。

### 7. 启动 PC 管理端

```bash
cd ../pc
npm install
npm start
```

PC 管理端将在 `http://localhost:3001` 运行。

## 项目结构

```
EasyHotel/
├── api/                    # 后端 API
│   ├── src/
│   │   ├── booking/        # 预订模块
│   │   ├── order/          # 订单模块
│   │   ├── queue/          # 消息队列模块
│   │   ├── inventory/      # 库存模块
│   │   ├── hotel/          # 酒店模块
│   │   ├── hotel-image/    # 酒店图片模块
│   │   ├── home-banner/    # 首页轮播图模块
│   │   ├── hotel-submission/ # 酒店提交审核模块
│   │   ├── room-type/      # 房型模块
│   │   ├── room-type-price-daily/ # 房型价格日历模块
│   │   ├── amenity/       # 设施模块
│   │   ├── user/           # 用户模块
│   │   ├── upload/         # 文件上传模块
│   │   └── common/         # 公共模块
│   ├── banner/             # 轮播图存储
│   ├── picture/            # 酒店图片存储
│   ├── test/               # 测试文件
│   ├── package.json        # 后端依赖配置
│   ├── .env.example        # 环境变量示例
│   ├── .dockerignore       # Docker 忽略文件
│   └── package-lock.json
├── min/                    # 小程序前端
│   ├── src/
│   │   ├── pages/          # 页面
│   │   │   ├── index/     # 首页
│   │   │   ├── hotel/      # 酒店相关
│   │   │   ├── book/       # 预订页
│   │   │   ├── order/      # 订单页
│   │   │   ├── user/       # 用户页
│   │   │   ├── login/      # 登录页
│   │   │   └── register/   # 注册页
│   │   ├── services/       # API 服务
│   │   ├── components/     # 组件
│   │   │   ├── calendar/   # 日历组件
│   │   │   ├── skeleton/   # 骨架屏组件
│   │   │   ├── city-selector/   # 城市选择器组件
│   │   │   ├── price-selector/   # 价格选择器组件
│   │   │   └── star-selector/   # 星级选择器组件
│   │   ├── utils/          # 工具函数
│   │   ├── styles/         # 样式变量
│   │   ├── app.tsx         # 应用入口
│   │   ├── app.scss        # 应用样式
│   │   └── app.config.ts   # 小程序配置（重要）
│   └── package.json        # 小程序依赖配置
├── pc/                     # PC 管理端
│   ├── src/
│   │   ├── pages/          # 页面
│   │   │   ├── admin/      # 管理员页面
│   │   │   ├── merchant/   # 商户页面
│   │   │   ├── Login.jsx   # 登录页
│   │   │   └── Register.jsx # 注册页
│   │   ├── api/           # API 服务
│   │   ├── components/     # 组件
│   │   ├── contexts/      # 上下文
│   │   ├── App.jsx        # 应用组件
│   │   ├── App.css        # 应用样式
│   │   ├── main.jsx       # 应用入口
│   │   └── index.css      # 全局样式
│   └── package.json        # PC端依赖配置
├── docker-compose.yml      # Docker Compose 配置（重要）
├── README.md
└── IMPLEMENTATION_SUMMARY.md
```

## 核心功能

### 用户端

#### 首页
- **轮播图展示**：展示酒店宣传图片，自动轮播切换
- **推荐酒店**：随机推荐酒店列表，展示酒店图片、名称、星级、价格
- **酒店搜索**：
  - 城市选择（下拉框）
  - 酒店名称输入
  - 入住/退房日期选择
  - 价格范围选择（弹窗输入最低/最高价格）
  - 星级选择（弹窗点击星星选择星级）
  - 标签选择
- **定位功能**：
  - 点击地球图标触发定位
  - 自动获取用户位置
  - 调用高德地图API获取省市区信息
  - 自动更新城市选项框
  - 显示定位气泡（30秒后消失）

#### 酒店列表
- 展示符合条件的酒店列表
- 支持分页加载
- 显示酒店图片、名称、星级、价格、地址
- 点击跳转到酒店详情页
- 日期选择器（入住/退房日期）
- 日期同步到详情页
- **下拉抽屉筛选**：
  - 点击城市/日期区域显示下拉抽屉
  - 城市选项：点击地球图标🌏触发定位，点击选项框打开城市选择器组件
  - 入住/退房日期：点击打开日历组件
  - 价格选项：点击打开价格选择器组件
  - 星级选项：点击打开星级选择器组件
  - 确认搜索按钮应用筛选条件

#### 酒店详情
- 展示酒店详细信息（图片、名称、星级、地址、设施）
- 展示房型列表（房型图片、名称、价格、库存）
- 日期选择器（入住/退房日期）
- 点击"预订"跳转到预订页
- 设施图标展示（WiFi、停车场、泳池、健身房等）
- 日期继承自列表页

#### 预订页
- 展示预订信息（酒店、房型、日期）
- 确认预订信息
- 提交订单
- 订单创建后60秒内未支付自动取消

#### 订单管理
- 展示订单列表
- 展示订单详情
- 订单状态：PENDING（待支付）、PAID（已支付）、CANCELLED（已取消）
- 待支付订单显示倒计时
- 支付成功后订单状态更新为PAID
- 超时未支付订单自动取消

#### 用户认证
- 用户登录（手机号+密码）
- 用户注册（手机号+密码）
- JWT token 认证
- 受保护路由需要登录

### 商户端

#### 概览
- 数据统计概览（订单数、收入、入住率等）
- 今日订单概览
- 待处理事项提醒
- 数据可视化展示

#### 酒店管理
- 酒店信息管理（酒店名称、地址、联系方式、星级等）
- 酒店图片上传和管理
- 酒店设施配置（WiFi、停车场、泳池、健身房等）
- 酒店状态管理（营业中、暂停营业）
- 酒店信息编辑和更新

#### 房型管理
- 房型添加（房型名称、面积、床型、入住人数等）
- 房型图片上传
- 房型编辑和删除
- 房型描述和设施配置
- 房型状态管理

#### 价格管理
- 价格日历管理
- 批量设置价格
- 特殊日期价格调整
- 价格策略配置
- 价格历史记录

#### 库存管理
- 库存日历管理
- 批量设置库存
- 库存调整和补充
- 库存预警设置
- 库存统计报表

#### 订单管理
- 订单列表查看
- 订单详情查看
- 订单状态管理（待确认、已确认、已完成、已取消）
- 订单筛选和搜索
- 订单导出功能
- 订单统计分析

#### 营销中心
- 优惠券管理
- 促销活动配置
- 会员管理
- 营销数据分析

#### 消息中心
- 消息列表查看
- 消息详情查看
- 消息分类管理
- 消息发送功能

#### 账户设置
- 账户信息管理
- 密码修改
- 联系方式更新
- 账户安全设置

#### 提交审核
- 酒店信息提交审核
- 审核进度查看
- 审核结果通知
- 审核不通过原因查看

### 管理员端

#### 商户管理
- 商户列表查看
- 商户信息管理
- 商户状态管理（启用、禁用）
- 商户审核（新商户注册审核）
- 商户权限管理
- 商户统计分析

#### 酒店审核
- 待审核酒店列表
- 酒店信息审核
- 酒店图片审核
- 审核通过/拒绝
- 审核意见反馈
- 审核历史记录

#### 审核中心
- 所有审核任务集中管理
- 审核进度跟踪
- 审核统计分析
- 审核规则配置

#### 轮播图管理
- 轮播图列表管理
- 轮播图上传
- 轮播图排序
- 轮播图启用/禁用
- 轮播图链接配置

#### 在线管理
- 在线用户监控
- 系统状态监控
- 日志查看
- 数据统计
- 系统配置

### 技术特性
- 消息队列（Bull + Redis）
- 自动取消过期订单（60秒）
- 库存锁定机制
- JWT 身份认证
- RESTful API 设计
- 地理位置服务（高德地图API）
- 响应式设计
- 优雅的UI交互

## Docker 服务说明

### Redis
- **端口**: 6379
- **用途**: 消息队列、缓存
- **数据持久化**: 启用 AOF

### PostgreSQL
- **端口**: 5432
- **用户名**: easyhotel
- **密码**: easyhotel123
- **数据库**: easyhotel
- **数据持久化**: Docker volume

## 常用命令

### Docker
```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f redis
docker-compose logs -f postgres
```

### 后端
```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod

# 运行测试
npm test

# 代码检查
npm run lint
```

### 小程序
```bash
# 开发模式
npm run dev:weapp

# 构建生产版本
npm run build:weapp
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 5432 |
| DB_USERNAME | 数据库用户名 | easyhotel |
| DB_PASSWORD | 数据库密码 | easyhotel123 |
| DB_DATABASE | 数据库名称 | easyhotel |
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |
| JWT_SECRET | JWT 密钥 | - |
| JWT_EXPIRES_IN | JWT 过期时间 | 7d |
| PORT | API 端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| ORDER_LOCK_TIME | 锁单时间（毫秒） | 60000 |
| AMAP_KEY | 高德地图API Key | - |

## API 文档

### 主要接口

#### 酒店相关
- `GET /mini/hotel/list` - 获取酒店列表
- `GET /mini/hotel/search` - 搜索酒店
- `GET /mini/hotel/recommend` - 推荐酒店
- `GET /mini/hotel/tags` - 获取标签
- `GET /mini/hotel/:id` - 获取酒店详情
- `GET /mini/hotel/location` - 定位服务（无需认证）

#### 订单相关
- `POST /order/create` - 创建订单
- `POST /order/:orderId/pay` - 支付订单
- `GET /order/list` - 获取订单列表
- `GET /order/:orderId` - 获取订单详情

#### 用户相关
- `POST /user/login` - 用户登录
- `POST /user/register` - 用户注册
- `GET /user/profile` - 获取用户信息

API 文档将在 `http://localhost:3000/api/docs` 提供（如果配置了 Swagger）。

## 故障排除

### Docker 服务无法启动
```bash
# 检查 Docker Desktop 是否运行
docker ps

# 查看服务日志
docker-compose logs
```

### Redis 连接失败
```bash
# 检查 Redis 是否运行
docker-compose ps redis

# 测试 Redis 连接
redis-cli ping
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 是否运行
docker-compose ps postgres

# 测试数据库连接
psql -h localhost -U easyhotel -d easyhotel
```

### 定位功能失败
```bash
# 检查 app.config.ts 是否配置了定位权限
# 检查高德地图 API Key 是否有效
# 检查后端定位接口是否正常运行
```

## 部署

### 生产环境部署

1. **准备服务器**
   - 购买云服务器（推荐 2核2GB）
   - 安装 Docker 和 Docker Compose

2. **配置环境变量**
   - 修改 `.env` 文件
   - 更改 JWT_SECRET 为强密码
   - 设置 NODE_ENV=production
   - 配置高德地图 API Key

3. **启动服务**
   ```bash
   docker-compose up -d
   npm run build
   npm run start:prod
   ```

4. **配置反向代理**
   - 使用 Nginx 反向代理 API 和前端
   - 配置 SSL 证书

### 小程序发布

1. **构建生产版本**
   ```bash
   cd min
   npm run build:weapp
   ```

2. **上传到微信开发者工具**
   - 打开微信开发者工具
   - 导入 `min/dist` 目录
   - 点击"上传"按钮

3. **提交审核**
   - 填写小程序信息
   - 提交审核

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或 Pull Request。

## 更多信息

详细的功能说明和实现细节，请查看 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
