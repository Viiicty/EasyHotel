# EasyHotel

一个基于 NestJS 和 Taro 的易宿酒店预订系统，包含小程序端、PC 管理端和后端 API。

## 技术栈

### 后端
- **NestJS** - Node.js 框架
- **TypeORM** - ORM 框架
- **PostgreSQL** - 数据库
- **Redis** - 消息队列和缓存
- **Bull** - 任务队列
- **JWT** - 身份认证

### 前端
- **Taro** - 小程序开发框架
- **React** - UI 框架
- **Ant Design** - PC 端 UI 组件库

## 快速开始

### 前置要求

- Node.js >= 16
- Docker Desktop
- Git

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
│   │   └── user/           # 用户模块
│   ├── package.json
│   └── .env.example
├── min/                    # 小程序前端
│   ├── src/
│   │   ├── pages/          # 页面
│   │   ├── services/       # API 服务
│   │   └── components/     # 组件
│   └── package.json
├── pc/                     # PC 管理端
│   ├── src/
│   │   ├── pages/          # 页面
│   │   ├── api/           # API 服务
│   │   └── components/     # 组件
│   └── package.json
├── docker-compose.yml      # Docker Compose 配置
└── README.md
```

## 核心功能

### 用户端
- 酒店搜索和浏览
- 酒店详情查看
- 房型预订
- 订单管理
- 用户认证

### 商户端
- 酒店管理
- 房型管理
- 价格管理
- 库存管理
- 订单管理

### 技术特性
- 消息队列（Bull + Redis）
- 自动取消过期订单
- 库存锁定机制
- JWT 身份认证
- RESTful API 设计

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

## API 文档

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

## 部署

### 生产环境部署

1. **准备服务器**
   - 购买云服务器（推荐 2核2GB）
   - 安装 Docker 和 Docker Compose

2. **配置环境变量**
   - 修改 `.env` 文件
   - 更改 JWT_SECRET 为强密码
   - 设置 NODE_ENV=production

3. **启动服务**
   ```bash
   docker-compose up -d
   npm run build
   npm run start:prod
   ```

4. **配置反向代理**
   - 使用 Nginx 反向代理 API 和前端
   - 配置 SSL 证书

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
